import React, { useEffect } from "react";

function Handler() {
  document.getElementsByClassName("Pane2")[0].remove();
  document.getElementsByClassName("Resizer")[0].remove();
  Array.from(document.getElementsByTagName("button"))
    .filter((element) => element.className.includes("EditorToggle"))
    .forEach((element) => element.remove());
  Array.from(document.getElementsByTagName("div"))
    .filter((element) => element.className.includes("ControlPaneContainer"))
    .forEach((element) => (element.style.minWidth = "100%"));
  document.getElementsByClassName("Pane1")[0].style.minWidth = "100%";

  return null;
}

function Admin() {
  useEffect(() => {
    (async () => {
      const CMS = await import("netlify-cms");
      CMS.registerPreviewTemplate("aboutPage", Handler);
      CMS.registerPreviewTemplate("contactPage", Handler);
      CMS.registerPreviewTemplate("landingPage", Handler);
    })();
  }, []);

  return null;
}

export default Admin;
