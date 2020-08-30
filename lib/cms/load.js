import fs from "fs";
import path from "path";

async function loadJsonFile({ path }) {
  let config;
  try {
    config = JSON.parse(await fs.promises.readFile(path));
    if (config.slug === undefined) {
      const pathComponents = path.split("/");
      const filename = pathComponents[pathComponents.length - 1];
      config.slug = filename.split(".").slice(0, -1).join(".");
    }
  } catch (err) {
    config = null;
  }
  return config;
}

async function loadJsonDirectory({ dirPath }) {
  let loadedDir;
  try {
    loadedDir = (
      await Promise.all(
        (await fs.promises.readdir(dirPath))
          .map((filename) => path.join(dirPath, filename))
          .map((path) => loadJsonFile({ path }))
      )
    ).reduce((acc, elem) => ({ ...acc, [elem.slug]: elem }), {});
  } catch (err) {
    loadedDir = {};
  }
  return loadedDir;
}

function populate({ toPopulate, populateFrom }) {
  const output = {};

  Object.keys(toPopulate).forEach((key) => {
    if (key in populateFrom) {
      if (toPopulate[key] === null) output[key] = null;
      else if (Array.isArray(toPopulate[key]))
        output[key] = toPopulate[key].map((slug) => populateFrom[key][slug]);
      else output[key] = populateFrom[key][toPopulate[key]];
    } else output[key] = toPopulate[key];
  });

  return output;
}

function deepPopulate({ objects, depth }) {
  function deepPopulateHelper({ objectsToPopulate, populateFrom, depth }) {
    if (depth <= 0) return populateFrom;

    return deepPopulateHelper({
      objectsToPopulate,
      populateFrom: Object.entries(objectsToPopulate).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: Object.entries(value).reduce(
            (acc, [key, subValues]) => ({
              ...acc,
              [key]: populate({
                toPopulate: subValues,
                populateFrom,
              }),
            }),
            {}
          ),
        }),
        {}
      ),
      depth: depth - 1,
    });
  }

  return deepPopulateHelper({
    objectsToPopulate: objects,
    populateFrom: objects,
    depth,
  });
}

export default async function load() {
  const cmsDir = path.join(process.cwd(), "lib/cms");

  const aboutPageConfig = await loadJsonFile({
    path: path.join(cmsDir, "about-page-config.json"),
  });
  const landingPageConfig = await loadJsonFile({
    path: path.join(cmsDir, "landing-page-config.json"),
  });
  const contactPageConfig = await loadJsonFile({
    path: path.join(cmsDir, "contact-page-config.json"),
  });

  const books = await loadJsonDirectory({
    dirPath: path.join(cmsDir, "books"),
  });
  const series = await loadJsonDirectory({
    dirPath: path.join(cmsDir, "series"),
  });
  const authors = await loadJsonDirectory({
    dirPath: path.join(cmsDir, "authors"),
  });
  const universes = await loadJsonDirectory({
    dirPath: path.join(cmsDir, "universes"),
  });

  const objects = {
    books,
    series,
    authors,
    universes,
  };

  const populatedObjects = deepPopulate({ objects, depth: 3 });

  return {
    staticPageConfigs: {
      aboutPageConfig,
      landingPageConfig,
      contactPageConfig,
    },
    objects: populatedObjects,
  };
}
