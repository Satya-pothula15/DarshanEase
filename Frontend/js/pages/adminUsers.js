renderers.adminusers = async () => {
  let users = [];
  try {
    users = (await apiGetUsers("devotee")).users;
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load users</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }

  return `
  <div class="page-wrap container">
    <h2 class="page-title teal-title">Users</h2>
    <table class="data">
      <tr><th>sl/no</th><th>UserId</th><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr>
      ${users.map((u, i) => `<tr>
        <td>${i + 1}</td><td class="mono">${esc(u._id)}</td><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td><td>${esc(fmtDate(u.createdAt))}</td>
      </tr>`).join("") || `<tr><td colspan="6">No users yet</td></tr>`}
    </table>
  </div>
  ${footerHTML()}
`;
};
