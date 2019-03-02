let fs = require('fs')
let path = require('path')
let chalk = require('chalk')
let task = require('./task')
let glob = require('glob')
let util = require('util')
let css = require('css')

let readFile = util.promisify(fs.readFile)

async function isComponent(wxmlPath){
  let pathOb = path.parse(wxmlPath)
  pathOb.base = ''
  pathOb.ext = '.json'
  let wpath = path.format(pathOb),
    data = null
  try {
    data = await readFile(wpath, 'utf8')
  } catch (error) {
  }
  if(!data || !JSON.parse(data).component) return false
  return true
}

function printWarns(warns){
  if(!warns.length) return 
  warns.forEach(warn => {
    console.log(chalk.yellow(`warning:${warn.filePath}\n`+`  lines:${warn.lines}  expression:${warn.expression}`))
  })
}
async function peelWXMiniprogram(){
  // find project root
  let testRoot = path.resolve(process.cwd(), './test/project')
  let configPath = path.resolve(testRoot, './project.config.json'),
    config = null
  try {
    config = await readFile(configPath, 'utf8')
  } catch (error) {
    config = ''
  }
  
  if(!config){
    console.log(chalk.yellow(`can't find project.config.json,use current directory for root`))
  }else {
    config = JSON.parse(config)
  }

  
  let root = path.resolve(testRoot, config.miniprogramRoot || ''),
   cssPath = path.resolve(root, './app.wxss'),
   wxmls = glob.sync('**/*.wxml', {
     cwd: root
   }).map(wxml => path.resolve(root, wxml))

   // filter page wxml
  for(let i = 0; i < wxmls.length; i++){
   if(await isComponent(wxmls[i])){
     wxmls[i] = ''
   }
  }
  wxmls = wxmls.filter(wxml => wxml)

  let { warns, cssAst, cssPath: entryCss } = await task(cssPath, wxmls),
   cssCode = css.stringify(cssAst)
  // rewrite css file

  fs.writeFileSync(entryCss, cssCode, 'utf8')

  console.log(chalk.green('peel success!'))
  if(warns.length){
    printWarns()
  }
  
}

peelWXMiniprogram()

