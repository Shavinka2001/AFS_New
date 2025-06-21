import React from "react";

const UserTable = ({ users, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }
  if (!users.length) {
    return <div className="text-center py-8 text-gray-500">No users found.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left border">
        <thead>
          <tr className="bg-blue-50">
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Phone</th>
            <th className="py-2 px-4">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b hover:bg-blue-50">
              <td className="py-2 px-4">{u.firstname} {u.lastname}</td>
              <td className="py-2 px-4">{u.email}</td>
              <td className="py-2 px-4">{u.phone}</td>
              <td className="py-2 px-4 capitalize">{u.userType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;