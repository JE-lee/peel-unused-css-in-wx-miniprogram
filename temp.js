/**
 * reduce the unused style code in the individual file.
 */

let glob = require('glob')
let chalk = require('chalk')
let fs = require('fs')
let path = require('path')
let css = require('css')

function extractClasses(str){
  let pattern = /\s*(.+\{[^{}]*\})\s*/,
    styles = str.split(pattern).filter(item => item.length), // remove empty element
    classes = []

  styles.forEach((item, i) => {
    let index = item.indexOf('{')
    if(index == -1) return // not valid class node 
    let names = item.slice(0,index).split(',').map(item => {
      let name = item.trim()
      return {
        className: name.replace(/\s*\.\s*/, ''),
        stylesIndex: i
      }
    })
    classes = classes.concat(names)
  })

  return {
    styles,
    classes
  }
}


(function(){
  // parse css files
  let cssPath = path.resolve(__dirname, './app.wxss'),
    cssStr = fs.readFileSync(cssPath,'utf8'),
    cssAst = css.parse(cssStr)
  
  // extract valid css class name
  let rules = cssAst.stylesheet.rules,
    classes = []
  
  rules.forEach((item, index) => {
    if(item.type != 'rule') return 

    item.selectors.forEach((i,k) => {
      let selClasses = i.match(/\.[^.:]+/g)
      if(!selClasses) return 

      selClasses = selClasses.map(cla => {
        return {
          selector: i,
          className: cla.trim(),
          selectorsIndex: k,
          rulesIndex: index
        }
      })

      classes = classes.concat(selClasses)
    })
    
  })

  let files = glob.sync('./**/*.wxml')
  if (!files) {
    console.log(chalk.red('error while reading .wxml file'))
    return
  }

  files.forEach((file, fIndex) => {
    console.log(`optimize ${file}, ${fIndex}/${files.length}`)
    // parse all class 
    let htmlStr = fs.readFileSync(path.resolve(__dirname, file),'utf8')
    let classArr = [], temp = [], pattern = /class\s*=\s*"([^>{}]*)"/g
    while((temp = pattern.exec(htmlStr)) != null){
      classArr.push(temp[1])
    }

    let classNames = []
    classArr.forEach(str => {
      classNames = classNames.concat(str.split(/\s+/).map(i => i.trim()))
    })
    // match

    classNames.forEach(cla => {
      let index = classes.findIndex(item => item.className.slice(1) == cla)
      index != -1 && classes.splice(index,1)
    })
  })

  // rubuild cssAst
  classes.forEach(ast => {
    let rule = rules[ast.rulesIndex]
    rule.selectors.splice(ast.selectorsIndex)
    cssAst.stylesheet.rules[ast.rulesIndex] = rule
  })
  
  // remove empty selectos 
  cssAst.stylesheet.rules = cssAst.stylesheet.rules.filter(rule => rule.type != 'rule' || rule.selectors.length)
  let cssCode = css.stringify(cssAst)
  // rewrite
  fs.writeFileSync(cssPath,cssCode,'utf8')
  console.log(chalk.green('success'))
})()
