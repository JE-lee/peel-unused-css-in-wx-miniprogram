let fs = require('fs')
let textParse = require('./text-parse')

async function extracClass(data, filePath){
  let temp = [], pattern = /class\s*=\s*"([^"]*)"/g,
    classNames = [], warn = []
  while ((temp = pattern.exec(data)) != null) {
    let arr = temp[1].split(/([^\s]*\{\{[^{}]*\}\}[^\s]*)/)
    for(let i = 0; i < arr.length; i ++){
      let item = arr[i].trim()
      let pushWarn = () => {
        let lines = data.slice(0, temp.index).split('\n').length
        warn.push({
          lines, // in which line 
          filePath, // in which file
          expression: item // the expression that was parsed with error
        })
      }
      if (item.indexOf('{') != -1) {
        // expression 
        let leftBraceIndex = item.indexOf('{'),
          rightBraceIndex = item.lastIndexOf('}'),
          prefix = item.slice(0, leftBraceIndex),
          suffix = item.slice(rightBraceIndex+1)
        let { classes, isHasValid } = await textParse(item.slice(leftBraceIndex + 2, rightBraceIndex - 1))
        if (isHasValid) {
          pushWarn()
        }
        classNames = classNames.concat(classes.map(cls => `${prefix}${cls}${suffix}`).filter(cls => cls))
        
      } else {
        item.split(/\s+/).forEach(cls => {
          if (/^[^|?.\/\\]+$/.test(cls)) {
            classNames.push(cls)
          } else {
            item && pushWarn()
          }
        })
        
      }

    }
  }

  return {
    warn,
    classNames,
    filePath
  }
}

module.exports = function parse(filePath){
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        resolve({ invalid: true })
        return
      }
      extracClass(data,filePath).then(res => {
        resolve(res)
      }).catch(err => {
        resolve({ invalid: true })
      })
    })
  })
}