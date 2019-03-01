let fs = require('fs')
let textParse = require('./text-parse')

async function handleClass(data, filePath){
  let temp = [], pattern = /class\s*=\s*"([^"]*)"/g,
    classNames = [], warn = []
  while ((temp = pattern.exec(data)) != null) {
    let arr = temp[1].split(/([^\s]*\{\{.*\}\}[^\s]*)/)
    for(let i = 0; i < arr.length; i ++){
      let item = arr[i].trim()
      let push = () => {
        let lines = data.slice(0, temp.index).split('\n').length
        warn.push({
          lines, // in which line 
          filePath, // in which file
          expression: item // the expression that was parsed with error
        })
      }
      if (item.indexOf('{') != -1) {
        // expression 
        let { classes, isHasValid } = await textParse(item.slice(item.indexOf('{') + 2, item.lastIndexOf('}') - 1))
        if (isHasValid) {
          push()
        } else {
          classNames = classNames.concat(classes)
        }
      } else {
        if (/^[^|?.\/\\]+$/.test(item)){
          classNames = classNames.concat(item.split(/\s+/))
        }else {
          item && push()
        }
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
      handleClass(data,filePath).then(res => {
        resolve(res)
      }).catch(err => {
        resolve({ invalid: true })
      })
    })
  })
}