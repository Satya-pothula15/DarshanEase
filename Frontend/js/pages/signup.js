renderers.signup = () => `
  <div class="page-wrap container">
    <div class="form-card">
      <h2>Create your account</h2>
      <div class="field"><label>Full name</label><input id="suName" placeholder="Your name"></div>
      <div class="field"><label>Email address</label><input id="suEmail" placeholder="Email address"></div>
      <div class="field"><label>Phone number</label><input id="suPhone" placeholder="10-digit mobile number"></div>
      <div class="field"><label>Password</label><input type="password" id="suPassword" placeholder="Password"></div>
      <div class="field"><label>Confirm password</label><input type="password" id="suConfirmPassword" placeholder="Confirm password"></div>
      <p id="signupError" style="color:#ffb4a8;font-size:13px;min-height:18px"></p>
      <button class="btn-solid" onclick="doSignup()">Create account</button>
      <div class="switch-link">Already have an account? <a onclick="go('login')">Log in</a></div>
    </div>
  </div>
  ${footerHTML()}
`;
