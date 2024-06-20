import { redirect } from "next/navigation";

import myCookies from "./myCookies";
import { CookieData } from "./myCookies";

function urlDashboard() {
  let redirectPath = "/";
  try {
    if (myCookies.cookieIsValid()) {
      console.log("redirect to dashboard");
      redirectPath = "/dashboard";
    } else {
      console.log("redirect to login");
      redirectPath = "/login";
    }
  } catch (error) {
    redirectPath = "/";
  } finally {
    redirect(redirectPath);
  }
}

function urlPrivateinfo() {
  redirect("/privateinfo");
}

function urlLogin() {
  redirect("/login");
}

export default {
  urlDashboard,
  urlPrivateinfo,
  urlLogin,
};
