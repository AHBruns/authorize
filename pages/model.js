import React from "react";
import load from "../lib/cms/load";

function Model(props) {
  return (
    <pre style={{ maxWidth: "100vw" }}>
      {JSON.stringify(props ?? {}, null, 2)}
    </pre>
  );
}

export async function getStaticProps() {
  return {
    props: await load(),
  };
}

export default Model;
