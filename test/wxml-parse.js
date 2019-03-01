let wxmlParse = require('../src/parse-wxml')
let path = require('path')
let assert = require('assert')

describe('wxml parse', function(){
  this.timeout(0)

  let test1 = path.resolve(__dirname, './wxml/test1.wxml')
  it('#test1', async function(){
    let { invalid, classNames, warn, filePath } = await wxmlParse(test1)
    assert.ok(!warn.length, 'warn的长度应该是0')
    assert.equal(classNames.length, 4 , 'class 的长度应该是4')
  })

  let test2 = path.resolve(__dirname, './wxml/test2.wxml')
  it('#test2', async function () {
    let { invalid, classNames, warn, filePath } = await wxmlParse(test2)
    assert.ok(!warn.length, 'warn的长度应该是0')
    assert.equal(classNames.length, 4, 'class 的长度应该是4')
  })

  let test3 = path.resolve(__dirname, './wxml/test3.wxml')
  it('#test3', async function () {
    let { invalid, classNames, warn, filePath } = await wxmlParse(test3)
    assert.ok(!warn.length, 'warn的长度应该是0')
    assert.equal(classNames.length, 4, 'class 的长度应该是4')
  })

  let test4 = path.resolve(__dirname, './wxml/test4.wxml')
  it('#test4', async function () {
    let { invalid, classNames, warn, filePath } = await wxmlParse(test4)
    assert.ok(warn.length == 2, 'warn的长度应该是2')
    assert.equal(classNames.length, 2, 'class 的长度应该是2')
    assert.equal(warn[0].lines, 1, '第一个警告的行数是1')
    assert.equal(warn[1].lines, 2, '第一个警告的行数是2')
  })
})