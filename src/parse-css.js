let css = require('css')
let fs = require('fs')
let path = require('path')

module.exports = function parse(filePath){
  return new Promise((resolve, reject) => {
    fs.readFile(filePath,'utf8', (err,data) => {
      if(err){
        resolve({ invalid: true })
        return 
      }

      let cssAst = null,
      // extract valid css class name
        rules = [],
        classes = []
      try {
        cssAst = css.parse(data)
        rules = cssAst.stylesheet.rules
      } catch (error) {
        resolve({ invalid: true })
      }
      

      rules.forEach((item, index) => {
        if (item.type != 'rule') return

        item.selectors.forEach((i, k) => {
          let selClasses = i.match(/\.[^.:]+/g)
          if (!selClasses) return

          selClasses = selClasses.map(cla => {
            return {
              selector: i,
              className: cla.trim().slice(1),
              selectorsIndex: k,
              rulesIndex: index
            }
          })

          classes = classes.concat(selClasses)
        })
      })

      resolve({
        classes,
        cssAst,
        filePath
      })

    })
  })
}