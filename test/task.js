let task = require('../src/task')
let path = require('path')
let glob = require('glob')
let assert = require('assert')

describe('task', function(){
  this.timeout(0)
  it('#1', async function(){
    let cssPath = path.resolve(__dirname, './task/app.wxss'),
      wxmls = glob.sync('**/*.wxml',{
        cwd: path.resolve(__dirname,'./task')
      })
    let { warns, cssAst } = await task(cssPath, wxmls.map(wxml => path.resolve(__dirname, './task', wxml)))
    assert.ok(!warns.length, '应该没有无法识别的插值表达式')
    assert.ok(cssAst.stylesheet.rules.length === 2, '应该只剩下2条规则')
    
  })
})