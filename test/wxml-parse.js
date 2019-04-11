let wxmlParse = require('../src/parse-wxml')
let path = require('path')
let assert = require('assert')

describe('wxml parse', function(){
  this.timeout(0)

  let test1 = path.resolve(__dirname, './wxml/test1.wxml')
  it('#test1', async function(){
    let { classNames, warn, filePath } = await wxmlParse(test1)
    assert.ok(!warn.length, 'warn的长度应该是0')
    assert.equal(classNames.length, 4 , 'class 的长度应该是4')
  })

  let test2 = path.resolve(__dirname, './wxml/test2.wxml')
  it('#test2', async function () {
    let { classNames, warn, filePath } = await wxmlParse(test2)
    assert.ok(!warn.length, 'warn的长度应该是0')
    assert.equal(classNames.length, 4, 'class 的长度应该是4')
  })

  let test3 = path.resolve(__dirname, './wxml/test3.wxml')
  it('#test3', async function () {
    let { classNames, warn, filePath } = await wxmlParse(test3)
    assert.ok(!warn.length, 'warn的长度应该是0')
    assert.equal(classNames.length, 4, 'class 的长度应该是4')
  })

  let test4 = path.resolve(__dirname, './wxml/test4.wxml')
  it('#test4', async function () {
    let { classNames, warn, filePath } = await wxmlParse(test4)
    assert.ok(warn.length == 2, 'warn的长度应该是2')
    assert.equal(classNames.length, 3, 'class 的长度应该是3')
  })

  let test5 = path.resolve(__dirname, './wxml/test5.wxml')
  it('#test5', async function () {
    let { classNames, warn, filePath } = await wxmlParse(test5)
    assert.ok(warn.length == 1, 'warn的长度应该是1')
    assert.equal(classNames.length, 3, 'class 的长度应该是3')
  })

  let test6 = path.resolve(__dirname, './wxml/test6.wxml')
  it('#test6', async function(){
    let { classNames, warn, filePath } = await wxmlParse(test6)
    assert.ok(warn.length == 0, '应该没有无效的表达式')
    assert.equal(classNames.length, 4, '应该提取到4个class')
    assert.equal(classNames[1], 'btn-red','第2个class应该是btn-red')
    assert.equal(classNames[2], 'btn-','第3个class应该是btn-red')
  })

  let test7 = path.resolve(__dirname, './wxml/test7.wxml')
  it('#test7', async function () {
    let { classNames, warn, filePath } = await wxmlParse(test7)
    assert.ok(warn.length == 0, '应该没有无效的表达式')
    assert.equal(classNames.length, 3, '应该提取到3个class')
    assert.equal(classNames[1], 'active', '第2个class应该是active')
    assert.equal(classNames[2], 'not-active', '第3个class应该是not-active')
  })
})