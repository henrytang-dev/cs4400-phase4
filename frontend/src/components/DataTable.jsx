import React from "react";

export default function DataTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <div className="card">No data</div>;
  }
  const headers = Object.keys(rows[0]);
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {headers.map((h) => (
                <td key={h}>{row[h]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
