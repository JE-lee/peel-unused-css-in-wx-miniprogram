let path = require('path')
let cssParse = require('../src/parse-css')
let assert = require('assert')

describe('css parse', function(){
  this.timeout(0)
  let test1 = path.resolve(__dirname, './css/test1.wxss')
  it('#test1.wxss',async function(){
    let result = await cssParse(test1)
    assert.equal(result.classes.length, 2, '提取的class长度应该是2')
  })

  let test2 = path.resolve(__dirname, './css/test2.wxss')
  it('#test2.wxss', async function () {
    let result = await cssParse(test2)
    assert.equal(result.classes.length, 2, '提取的class长度应该是2')
    assert.equal(result.classes[0].rulesIndex, 1, '第1个class的rulesIndex应该是1')
    assert.equal(result.classes[1].rulesIndex, 1, '第2个class的rulesIndex应该是1')
    assert.strictEqual(result.classes[0].selectorsIndex, 0, '第1个class的rulesIndex应该是0')
    assert.strictEqual(result.classes[1].selectorsIndex, 1, '第2个class的rulesIndex应该是1')
    assert.strictEqual(result.classes[1].className, '.head', '第2个class应该是.head')
  })

  let test3 = path.resolve(__dirname, './css/test3.wxss')
  it('#test3.wxss', async function () {
    let result = await cssParse(test3)
    assert.equal(result.classes.length, 4, '提取的class长度应该是4')
  })

  let test4 = path.resolve(__dirname, './css/test4.wxss')
  it('#test4.wxss', async function () {
    let result = await cssParse(test4)
    assert.ok(result.invalid)
  })
})