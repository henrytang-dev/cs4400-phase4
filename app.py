from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

def get_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def get_row(query, params=()):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params)
        return cursor.fetchone()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def get_scalar(query, params=()):
    row = get_row(query, params)
    if not row:
        return None
    return list(row.values())[0]


def execute_procedure(name, params):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.callproc(name, params)
        conn.commit()
        return True, None
    except Exception as e:
        if conn:
            conn.rollback()
        return False, str(e)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def fetch_view(query):
    # should clean up the row parsign error
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query)
        rows = cursor.fetchall()
        cleaned = []
        for row in rows:
            cleaned_row = {}
            for k, v in row.items():
                if hasattr(v, "isoformat"):
                    cleaned_row[k] = v.isoformat()
                elif hasattr(v, "seconds"):
                    cleaned_row[k] = str(v)
                elif v.__class__.__name__ == "Decimal":
                    cleaned_row[k] = float(v)
                else:
                    cleaned_row[k] = v
            cleaned.append(cleaned_row)
        return True, cleaned
    except Exception as e:
        if conn:
            conn.rollback()
        return False, str(e)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def patient_exists(ssn):
    return bool(get_scalar("select 1 from patient where ssn=%s", (ssn)))


def staff_exists(ssn):
    return bool(get_scalar("select 1 from staff where ssn=%s", (ssn)))


def doctor_exists(ssn):
    return bool(get_scalar("select 1 from doctor where ssn=%s", (ssn)))


def nurse_exists(ssn):
    return bool(get_scalar("select 1 from nurse where ssn=%s", (ssn)))


def dept_exists(dept_id):
    return bool(get_scalar("select 1 from department where deptId=%s", (dept_id)))


def works_in(ssn, dept_id):
    return bool(
        get_scalar("select 1 from works_in where staffSsn=%s and deptId=%s", (ssn, dept_id))
    )


def appointment_exists(patient_id, appt_date, appt_time):
    return bool(
        get_scalar(
            "select 1 from appointment where patientId=%s and apptDate=%s and apptTime=%s",
            (patient_id, appt_date, appt_time)
        )
    )


def patient_has_appointments(ssn):
    return bool(get_scalar("select 1 from appointment where patientId=%s limit 1", (ssn)))


def patient_has_orders(ssn):
    return bool(get_scalar("select 1 from med_order where patientId=%s limit 1", (ssn)))


def patient_funds_and_charges(ssn):
    row = get_row(
        """
        select patient.funds as funds, ifnull(a.totalCost,0)+ifnull(o.totalCost,0) as charges from patient
        left join (select patientId, sum(cost) as totalCost from appointment group by patientId) a on a.patientId = patient.ssn
        left join (select patientId, sum(cost) as totalCost from med_order group by patientId) o on o.patientId = patient.ssn
        where patient.ssn = %s
        """, (ssn)
    )
    return row or {"funds": None, "charges": None}


def combine_dt(date_str, time_str):
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d").date()
        t = datetime.strptime(time_str, "%H:%M:%S").time()
        return datetime.combine(d, t)
    except Exception:
        return None


def error(message, code=400):
    return jsonify({"success": False, "error": message}), code


@app.route("/api/patients/add", methods=["POST"])
def add_patient():
    data = request.get_json()
    required = ["ssn", "first_name", "last_name", "birthdate", "address", "funds", "contact"]
    if not all(data.get(k) for k in required):
        return error("Missing required fields")
    funds_val = get_int(data.get("funds"))
    if funds_val is None:
        return error("Invalid funds")
    
    success, err = execute_procedure("add_patient", (data.get("ssn"), data.get("first_name"), data.get("last_name"), data.get("birthdate"), data.get("address"), funds_val, data.get("contact")))
    if not success:
        return error(err or "Database error")
    if not patient_exists(data.get("ssn")):
        return error("Patient not created")
    return jsonify({"success": True})


@app.route("/api/patients/add_funds", methods=["POST"])
def add_funds():
    data = request.get_json()
    ssn = data.get("ssn")
    funds_val = get_int(data.get("funds"))
    if not ssn or funds_val is None or funds_val <= 0:
        return error("Invalid input")
    if not patient_exists(ssn):
        return error("Patient not found")
    
    success, err = execute_procedure("add_funds", (ssn, funds_val))
    if not success:
        return error(err or "Database error")
    return jsonify({"success": True})


@app.route("/api/patients/outstanding_charges", methods=["GET"])
def outstanding_charges():
    
    success, data = fetch_view("SELECT * FROM outstanding_charges_view")
    if success:
        return jsonify({"success": True, "data": data})
    return error(data or "Database error")


@app.route("/api/departments/add_staff", methods=["POST"])
def add_staff():
    data = request.get_json()
    dept_id = get_int(data.get("deptId"))
    
    staff_id = get_int(data.get("staffId"))
    salary = get_int(data.get("salary"))
    required = [data.get("ssn"),data.get("firstName"), data.get("lastName"), data.get("birthdate"), data.get("startdate"), data.get("address")]
    if dept_id is None or staff_id is None or salary is None or not all(required):
        return error("Invalid input")
    if not dept_exists(dept_id):
        return error("Department not found")
    
    success, err = execute_procedure("add_staff_to_dept", (dept_id, data.get("ssn"), data.get("firstName"), data.get("lastName"), data.get("birthdate"), data.get("startdate"), data.get("address"), staff_id, salary))
    if not success:
        return error(err or "Database error")
    if not works_in(data.get("ssn"), dept_id):
        return error("Staff not added")
    return jsonify({"success": True})


@app.route("/api/departments/remove_staff", methods=["POST"])
def remove_staff_from_dept():
    data = request.get_json()
    ssn = data.get("ssn")
    dept_id = get_int(data.get("deptId"))
    if not ssn or dept_id is None:
        return error("Invalid input")
    if not works_in(ssn, dept_id):
        return error("Staff is not in department")
    manager = get_scalar("select manager from department where deptId=%s", (dept_id))
    if manager == ssn:
        return error("Cannot remove department manager")
    staff_count = get_scalar("select count(*) from works_in where deptId=%s", (dept_id))
    if staff_count is not None and staff_count <= 1:
        return error("Department must keep at least one staff")
    success, err = execute_procedure("remove_staff_from_dept", (ssn, dept_id))
    if not success:
        return error(err or "Database error")
    if works_in(ssn, dept_id):
        return error("Staff not removed from department")
    return jsonify({"success": True})


@app.route("/api/departments/manage", methods=["POST"])
def manage_department():
    data = request.get_json()
    ssn = data.get("ssn")
    dept_id = get_int(data.get("deptId"))
    if not ssn or dept_id is None:
        return error("Invalid input")
    if not staff_exists(ssn):
        return error("Staff not found")
    if not dept_exists(dept_id):
        return error("Department not found")
    if get_scalar("select count(*) from department where manager=%s", (ssn)) > 0:
        return error("Staff already manages a department")
    lone_rows = get_row(
        """
        select 1 from works_in wi where wi.staffSsn=%s and wi.deptId<>%s and 1=(select count(*) from works_in w2 where w2.deptId=wi.deptId) limit 1
        """,(ssn, dept_id),
    )
    if lone_rows:
        return error("Staff is sole member of another department")
    success, err = execute_procedure("manage_department", (ssn, dept_id))
    if not success:
        return error(err or "Database error")
    manager = get_scalar("select manager from department where deptId=%s", (dept_id))
    if manager != ssn:
        return error("Manager not assigned")
    return jsonify({"success": True})


@app.route("/api/departments/view", methods=["GET"])
def department_view():
    success, data = fetch_view("SELECT * from department_view")
    if success:
        return jsonify({"success": True, "data": data})
    return error(data or "Database error")


@app.route("/api/medical_staff/view", methods=["GET"])
def medical_staff_view():
    success, data = fetch_view("SELECT * FROM medical_staff_view")
    
    if success:
        return jsonify({"success": True, "data": data})
    return error(data or "Database error")


@app.route("/api/appointments/book", methods=["POST"])
def book_appointment():
    data = request.get_json()
    patient_id = data.get("patientId")
    appt_cost = get_int(data.get("apptCost"))
    appt_date = data.get("apptDate")
    appt_time = data.get("apptTime")
    if not patient_id or appt_cost is None or appt_cost < 0 or not appt_date or not appt_time:
        return error("Invalid input")
    
    if not patient_exists(patient_id):
        return error("Patient not found")
    dt = combine_dt(appt_date, appt_time)
    
    if not dt or dt <= datetime.now():
        return error("Appointment must be in the future")
    if appointment_exists(patient_id, appt_date, appt_time):
        return error("Conflicting appointment")
    funds = patient_funds_and_charges(patient_id)
    if funds["funds"] is None or funds["funds"] < funds["charges"] + appt_cost:
        return error("Insufficient funds")
    
    
    success, err = execute_procedure("book_appointment", (patient_id, appt_date, appt_time, appt_cost))
    if not success:
        return error(err or "Database error")
    if not appointment_exists(patient_id, appt_date, appt_time):
        return error("Appointment not booked")
    return jsonify({"success": True})


@app.route("/api/appointments/assign_doctor", methods=["POST"])
def assign_doctor():
    data = request.get_json()
    patient_id = data.get("patientId")
    
    doctor_id = data.get("doctorId")
    appt_date = data.get("apptDate")
    appt_time = data.get("apptTime")
    if not all([patient_id, doctor_id, appt_date, appt_time]):
        return error("Invalid input")
    
    if not appointment_exists(patient_id, appt_date, appt_time):
        return error("Appointment not found")
    if not doctor_exists(doctor_id):
        return error("Doctor not found")
    if get_scalar("select 1 from appt_assignment where patientId=%s and apptDate=%s and apptTime=%s and doctorId=%s",(patient_id, appt_date, appt_time, doctor_id)):
        return error("Doctor already assigned")
    count = get_scalar("select count(*) from appt_assignment where patientId=%s and apptDate=%s and apptTime=%s",(patient_id, appt_date, appt_time))
    
    if count is not None and count >= 3:
        return error("Appointment already has 3 doctors")
    if get_scalar("select 1 from appt_assignment where doctorId=%s and apptDate=%s and apptTime=%s and patientId<>%s",(doctor_id, appt_date, appt_time, patient_id)):
        return error("Doctor has another appointment at that time")
    
    success, err = execute_procedure("assign_doctor_to_appointment", (patient_id, appt_date, appt_time, doctor_id))
    if not success:
        return error(err or "Database error")
    assigned = get_scalar("select 1 from appt_assignment where patientId=%s and apptDate=%s and apptTime=%s and doctorId=%s",(patient_id, appt_date, appt_time, doctor_id))
    
    if not assigned:
        return error("Doctor not assigned")
    return jsonify({"success": True})


@app.route("/api/appointments/record_symptom", methods=["POST"])
def record_symptom():
    data = request.get_json()
    patient_id = data.get("patientId")
    num_days = get_int(data.get("numDays"))
    
    appt_date = data.get("apptDate")
    appt_time = data.get("apptTime")
    symptom_type = data.get("symptomType")
    if not all([patient_id, appt_date, appt_time, symptom_type]) or num_days is None:
        return error("Invalid input")
    
    if not appointment_exists(patient_id, appt_date, appt_time):
        return error("Appointment not found")
    if get_scalar(
        "select 1 from symptom where symptomType=%s and numDays=%s and patientId=%s and apptDate=%s and apptTime=%s",(symptom_type, num_days, patient_id, appt_date, appt_time),):
        return error("Symptom already recorded")
    success, err = execute_procedure("record_symptom", (patient_id, num_days, appt_date, appt_time, symptom_type))
    if not success:
        return error(err or "Database error")
    
    if not get_scalar(
        "select 1 from symptom where symptomType=%s and numDays=%s and patientId=%s and apptDate=%s and apptTime=%s", (symptom_type, num_days, patient_id, appt_date, appt_time),):
        return error("Symptom not recorded")
    
    return jsonify({"success": True})


@app.route("/api/appointments/symptoms_overview", methods=["GET"])
def symptoms_overview():
    success, data = fetch_view("SELECT * FROM symptoms_overview_view")
    if success:
        return jsonify({"success": True, "data": data})
    return error(data or "Database error")


@app.route("/api/appointments/complete", methods=["POST"])
def complete_appointment():
    data = request.get_json()
    patient_id = data.get("patientId")
    
    appt_date = data.get("apptDate")
    appt_time = data.get("apptTime")
    if not all([patient_id, appt_date, appt_time]):
        return error("Invalid input")
    
    if not appointment_exists(patient_id, appt_date, appt_time):
        return error("Appointment not found")
    success, err = execute_procedure("complete_appointment", (patient_id, appt_date, appt_time))
    if not success:
        return error(err or "Database error")
    
    if appointment_exists(patient_id, appt_date, appt_time):
        return error("Appointment not completed")
    return jsonify({"success": True})


@app.route("/api/orders/place", methods=["POST"])
def place_order():
    data = request.get_json()
    order_number = get_int(data.get("orderNumber"))
    priority = get_int(data.get("priority"))
    patient_id = data.get("patientId")
    doctor_id = data.get("doctorId")
    
    cost = get_int(data.get("cost"))
    lab_type = data.get("labType")
    drug = data.get("drug")
    dosage = get_int(data.get("dosage"))
    if (
        order_number is None or order_number <= 0 or priority is None or priority < 1 or priority > 5
        or not patient_id or not doctor_id or cost is None or cost < 0):
        
        return error("Invalid input")
    
    if not patient_exists(patient_id):
        return error("Patient not found")
    if not doctor_exists(doctor_id):
        
        return error("Doctor not found")
    if lab_type:
        if drug or dosage is not None:
            return error("Provide lab type or prescription, not both")
    else:
        if not drug or dosage is None:
            return error("Prescription requires drug and dosage")
        if dosage <= 0:
            return error("Invalid dosage")
    if get_scalar("select 1 from med_order where orderNumber=%s", (order_number)):
        return error("order number already exists")
    
    funds = patient_funds_and_charges(patient_id)
    if funds["funds"] is None or funds["funds"] < funds["charges"] + cost:
        return error("insufficient funds")
    success, err = execute_procedure("place_order", (order_number, priority, patient_id, doctor_id, cost, lab_type, drug, dosage))
    if not success:
        return error(err or "Database error")
    if not get_scalar("select 1 from med_order where orderNumber=%s", (order_number)):
        return error("Order not placed")
    return jsonify({"success": True})


@app.route("/api/orders/complete", methods=["POST"])
def complete_orders():
    data = request.get_json()
    num_orders = get_int(data.get("num_orders"))
    
    if num_orders is None or num_orders <= 0:
        
        return error("invalid input")
    success, err = execute_procedure("complete_orders", (num_orders,))
    if not success:
        return error(err or "Database error")
    return jsonify({"success": True})


@app.route("/api/rooms/assign_nurse", methods=["POST"])
def assign_nurse():
    data = request.get_json()
    nurse_id = data.get("nurseId")
    room_number = get_int(data.get("roomNumber"))
    if not nurse_id or room_number is None:
        return error("Invalid input")
    if not nurse_exists(nurse_id):
        return error("Nurse not found")
    if not get_scalar("select 1 from room where roomNumber=%s", (room_number,)):
        return error("Room not found")
    count = get_scalar(
        "select count(*) from room_assignment where nurseId=%s", (nurse_id,)
    )
    
    if count is not None and count >= 4:
        return error("Nurse already assigned to 4 rooms")
    if get_scalar("select 1 from room_assignment where roomNumber=%s and nurseId=%s", (room_number, nurse_id),):
        return error("Nurse already assigned to this room")
    
    success, err = execute_procedure("assign_nurse_to_room", (nurse_id, room_number))
    if not success:
        return error(err or "Database error")
    if not get_scalar(
        "select 1 from room_assignment where roomNumber=%s and nurseId=%s",
        (room_number, nurse_id),
    ):
        return error("Nurse not assigned")
    return jsonify({"success": True})


@app.route("/api/rooms/assign_patient", methods=["POST"])
def assign_patient():
    data = request.get_json()
    ssn = data.get("ssn")
    room_number = get_int(data.get("roomNumber"))
    room_type = data.get("roomType")
    if not ssn or room_number is None or not room_type:
        return error("Invalid input")
    if not patient_exists(ssn):
        return error("Patient not found")
    
    room_row = get_row("select roomType, occupiedBy from room where roomNumber=%s", (room_number))
    if not room_row:
        return error("Room not found")
    if room_row["roomType"] != room_type:
        return error("Room type mismatch")
    if room_row["occupiedBy"]:
        return error("Room is occupied")
    success, err = execute_procedure("assign_room_to_patient", (ssn, room_number, room_type))
    if not success:
        return error(err or "Database error")
    occupied = get_scalar("select occupiedBy from room where roomNumber=%s", (room_number))
    
    if occupied != ssn:
        return error("Room not assigned")
    return jsonify({"success": True})


@app.route("/api/rooms/release", methods=["POST"])
def release_room():
    data = request.get_json()
    room_number = get_int(data.get("roomNumber"))
    
    if room_number is None:
        return error("Invalid input")
    if not get_scalar("select 1 from room where roomNumber=%s", (room_number)):
        return error("Room not found")
    success, err = execute_procedure("release_room", (room_number))
    if not success:
        return error(err or "Database error")
    if get_scalar("select occupiedBy from room where roomNumber=%s", (room_number)):
        return error("Room not released")
    return jsonify({"success": True})


@app.route("/api/rooms/overview", methods=["GET"])
def room_overview():
    success, data = fetch_view("SELECT * FROM room_wise_view")
    if success:
        return jsonify({"success": True, "data": data})
    return error(data or "Database error")


@app.route("/api/staff/remove", methods=["POST"])
def remove_staff():
    data = request.get_json()
    ssn = data.get("ssn")
    if not ssn:
        return error("Invalid input")
    if not staff_exists(ssn):
        return error("Staff not found")
    success, err = execute_procedure("remove_staff", (ssn,))
    if not success:
        return error(err or "Database error")
    if staff_exists(ssn):
        return error("Staff not removed")
    return jsonify({"success": True})


@app.route("/api/patients/remove", methods=["POST"])
def remove_patient():
    data = request.get_json()
    ssn = data.get("ssn")
    if not ssn:
        return error("Invalid input")
    if not patient_exists(ssn):
        return error("Patient not found")
    
    blockers = []
    if patient_has_appointments(ssn):
        blockers.append("appointments")
    if patient_has_orders(ssn):
        blockers.append("orders")
    if blockers:
        return error("Cannot remove patient with existing " + " and ".join(blockers))
    
    success, err = execute_procedure("remove_patient", (ssn))
    if not success:
        return error(err or "Database error")
    if patient_exists(ssn):
        blockers = []
        if patient_has_appointments(ssn):
            blockers.append("appointments")
        if patient_has_orders(ssn):
            blockers.append("orders")
        if blockers:
            return error("Cannot remove patient with existing " + " and ".join(blockers))
        return error("Patient not removed")
    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
