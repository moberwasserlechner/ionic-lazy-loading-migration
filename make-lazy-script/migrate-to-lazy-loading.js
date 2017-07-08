const fs = require('fs');
const path = require('path');

// flags
let simulate = true;
let logContents = false;
let excludePages = false;
let excludeComponents = false;
let excludePageCleanUp = false;
let noNgxTranslate = false;

// ##############################################################################
// this folders might exists anywhere in the directory structure

let pagesFolder = "pages";
let componentsFolder = "components";

// ##############################################################################

class ClassHolder {
  constructor(name, path) {
    this.name = name;
    this.path = path;
  }
}

// resolve cli arguments

for (let val of process.argv) {
  if (val === "dont-simulate")  {
    simulate = false;
  }
  if (val === "log-contents")  {
    logContents = true;
  }

  if (val === "exclude-pages")  {
    excludePages = true;
  }

  if (val === "exclude-components")  {
    excludeComponents = true;
  }

  if (val === "exclude-page-cleanup")  {
    excludePageCleanUp = true;
  }

  if (val === "no-ngx-translate")  {
    noNgxTranslate = true;
  }
}

let files = readRecursive("./", null, "src");
if (files.length > 0) {

  let pageCnt = 0;
  let componentCnt = 0;
  let classes = [];

  // templates
  let pageModuleTemplate = fs.readFileSync(path.join(__dirname, "page.module.ngx-translate.tpl.txt"), "utf8");
  // use does not have ngx translate
  if (noNgxTranslate) {
    pageModuleTemplate = fs.readFileSync(path.join(__dirname, "page.module.tpl.txt"), "utf8");
  }
  let componentModuleTemplate = fs.readFileSync(path.join(__dirname, "component.module.tpl.txt"), "utf8");
  let ionicPageReplacement = fs.readFileSync(path.join(__dirname, "ionicpage.tpl.txt"), "utf8");

  // regular expressions
  const pagesRegExp = new RegExp(pagesFolder || "pages");
  const componentsRegExp = new RegExp(componentsFolder || "components");
  const classNameRegExp = /export class ([a-zA-Z]*?) .*{/;

  for (let classPath of files) {
    if (!excludePages) {
      if (classPath.match(pagesRegExp) && classPath.match(/\.ts$/) && !classPath.match(/\.spec\.ts$/)) {

        let basename = path.basename(classPath, ".ts");
        let modulePath = path.join(path.dirname(classPath), basename + ".module.ts");


        if (!fs.existsSync(modulePath)) {
          // extract class name from file
          let classContent = fs.readFileSync(classPath, "utf8");
          const regexResult = classNameRegExp.exec(classContent);
          if (regexResult && classContent.match(/@Component\(/)) {
            let classname = regexResult[1];
            if (classname) { // && !classname.match(/Page$/)
              pageCnt++;
              classname = classname.trim();
              classes.push(new ClassHolder(classname, classPath));
              console.log("\nPage class: " + classname);
              // console.log("Page path: " + classPath);
              // create module.ts
              let moduleContent = pageModuleTemplate.replace(/LAZY-CLASSNAME-PLACEHOLDER/g, classname);
              moduleContent = moduleContent.replace(/LAZY-FILENAME-PLACEHOLDER/g, basename);

              if (logContents) {
                console.log("Module path: " + modulePath);
                console.log(moduleContent);
              }
              if (!simulate) {
                // write module.ts file
                fs.writeFileSync(modulePath, moduleContent, "utf8");
              }

              // update page controller
              if (!classContent.match(/@IonicPage\(/)) {
                classContent = classContent.replace(/@Component\({/, ionicPageReplacement);
                if (logContents) {
                  console.log(classContent);
                }
                if (!simulate) {
                  fs.writeFileSync(classPath, classContent, "utf8");
                }
              } else {
                console.warn("@IonicPage already included in "+classPath);
              }
              //
              //break;
            }
          }
        } else {
          console.warn("Pages: '"+modulePath+"' already exists! No changes!");
        }
      } // pages
    }

    if (!excludeComponents) {
      if (classPath.match(componentsRegExp) && classPath.match(/\.ts$/) && !classPath.match(/\.spec\.ts$/)) {
        let basename = path.basename(classPath, ".ts");
        let modulePath = path.join(path.dirname(classPath), basename + ".module.ts");

        if (!fs.existsSync(modulePath)) {
          // extract class name from file
          let classContent = fs.readFileSync(classPath, "utf8");
          const regexResult = classNameRegExp.exec(classContent);
          if (regexResult && classContent.match(/@Component\(/)) {
            let classname = regexResult[1];
            if (classname) { // && !classname.match(/Page$/)
              componentCnt++;
              classname = classname.trim();
              classes.push(new ClassHolder(classname, classPath));
              console.log("\nComponent class: " + classname);
              // console.log("Page path: " + classPath);
              // create module.ts
              let moduleContent = componentModuleTemplate.replace(/LAZY-CLASSNAME-PLACEHOLDER/g, classname);
              moduleContent = moduleContent.replace(/LAZY-FILENAME-PLACEHOLDER/g, basename);

              if (logContents) {
                console.log("Component module path: " + modulePath);
                console.log(moduleContent);
              }
              if (!simulate) {
                // write module.ts file
                fs.writeFileSync(modulePath, moduleContent, "utf8");
              }
            }
          }
        } else {
          console.warn("Components: '"+modulePath+"' already exists! No changes!");
        }
      }
    }

  } //

  console.log("\n");
  if (!excludePages) {
    console.log(pageCnt + " pages found!");
  }
  if (!excludeComponents) {
    console.log(componentCnt + " components found!");
  }

  if (!excludePageCleanUp) {
    for (let f of files) {
      if (f.match(/\.ts$/) && !f.match(/\.spec\.ts$/)) {
        let original = fs.readFileSync(f, "utf8");
        let replaced = original;

        for (let classHolder of classes) {
          if (f === classHolder.path) {
            continue;
          }

          replaced = replaced.replace(new RegExp(".*import { *"+classHolder.name+" *} from .*", 'mg'), "");

          replaced = replaced.replace(new RegExp("\\("+classHolder.name, 'g'), "('"+classHolder.name+"'");
          replaced = replaced.replace(new RegExp(" "+classHolder.name, 'g'), " '"+classHolder.name+"'");
          replaced = replaced.replace(new RegExp("="+classHolder.name, 'g'), "='"+classHolder.name+"'");
        }

        if (original !== replaced) {
          if (logContents) {
            console.log(replaced);
          }

          if (!simulate) {
            fs.writeFileSync(f, replaced, "utf8");
          } else {

          }
        }
      }
    }
  }
}

// based on https://github.com/fs-utils/fs-readdir-recursive
function readRecursive(root, files, prefix) {
  prefix = prefix || '';
  files = files || [];

  let dir = path.join(root, prefix);
  if (!fs.existsSync(dir)) {
    return files
  }
  if (fs.statSync(dir).isDirectory()) {
    fs.readdirSync(dir)
      .filter(noDotFiles)
      .forEach((name) => {
        readRecursive(root, files, path.join(prefix, name))
      });
  } else {
    files.push(prefix);
  }

  return files
}

function noDotFiles(x) {
  return x[0] !== '.'
}
