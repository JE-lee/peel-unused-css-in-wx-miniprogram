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

async function peelWXMiniprogram(cwd){
  // find project root
  let configPath = path.resolve(cwd, './project.config.json'),
    config = null
  try {
    config = await readFile(configPath, 'utf8')
  } catch (error) {
    
  }
  
  if(!config){
    console.log(chalk.yellowBright(`can't find project.config.json,use current directory for root`))
    config = {}
  }else {
    config = JSON.parse(config)
  }

  let root = path.resolve(cwd, config.miniprogramRoot || ''),
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
  await task(cssPath, wxmls)
}

module.exports = peelWXMiniprogram

