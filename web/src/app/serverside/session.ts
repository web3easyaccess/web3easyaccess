import { cookies } from "next/headers";

export async function getSession() {
  const sessionId = cookies().get("sessionId")?.value;
  console.log("cookies::session::====", cookies());
  console.log("cookies::session:222:====", cookies().get("sessionId"));
  console.log("cookies::session:333:====", cookies().get("email"));
  if (typeof sessionId == "string") {
    if (sessionId.length > 0) {
      // session.user.role !== "admin"
      return {
        user: {
          id: 123,
          role: "user",
        },
      };
    }
  }
  // cookies().getAll();
  // return sessionId;
}

function decrypt(d) {
  return d;
}

export async function getSessionData(req) {
  const encryptedSessionData = cookies().get("session")?.value;
  return encryptedSessionData
    ? JSON.parse(decrypt(encryptedSessionData))
    : null;
}
