export function rynxpenseAuthEmailSubject(action: string): string {
  if (action === "recovery") return "Rynxpense — reset your access";
  return "Rynxpense — your trip planner login code";
}

export function rynxpenseAuthEmailHtml(token: string, action: string): string {
  const headline = action === "recovery" ? "Reset access to Rynxpense" : "Your Rynxpense login code";
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F7F9FC;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:16px;padding:30px 28px;border:1px solid #E5E7EB;">
      <div style="margin-bottom:14px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5722;margin-right:8px;"></span>
        <span style="font-weight:bold;font-size:20px;color:#0283DF;">Rynxpense</span>
      </div>
      <p style="margin:0 0 6px;font-size:16px;font-weight:bold;">${headline}</p>
      <p style="margin:0 0 18px;font-size:14px;color:#6B7280;">Enter this code to plan trips and track your travel budget.</p>
      <div style="display:inline-block;background:#E8F4FD;border-radius:12px;padding:14px 24px;font-size:30px;letter-spacing:0.28em;font-family:monospace;color:#0283DF;">${token}</div>
      <p style="margin:22px 0 0;font-size:12px;color:#9CA3AF;">If you did not request this, you can safely ignore this email.</p>
    </div>
    <p style="text-align:center;font-size:11px;color:#9CA3AF;margin-top:14px;">Rynxpense — plan your trip, track every peso</p>
  </div>
</body>
</html>`;
}

// In renderAuthEmailHtml:
// if (app === "rynxpense") return rynxpenseAuthEmailHtml(token, action);
//
// In authEmailSubject:
// if (app === "rynxpense") return rynxpenseAuthEmailSubject(action);
