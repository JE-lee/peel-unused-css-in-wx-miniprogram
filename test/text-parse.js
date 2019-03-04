let textParse = require('../src/text-parse')
let assert = require('assert')

describe('text parse', function(){
  this.timeout(0)
  let test1 = `index ? 'red' : ''`
  it(test1, async function(){
    let expression = test1,
      result = await textParse(expression)
    assert.equal(result.classes[0], 'red' , '提取的第一个class应该是 red')
    assert.ok(result.classes.length == 2, '提取的class的数量为2')
    assert.ok(!result.isHasValid, '应该没有无效的表达式')
  })

  let test2 = `index ? 'red' : index ? 'yellow' : ' blue'`
  it(test2, async function () {
    let expression = test2,
      result = await textParse(expression)
    assert.equal(result.classes.length, 3, '提取的class长度应该是3')
    assert.strictEqual(result.classes[result.classes.length-1], 'blue', '最后一个class应该是blue')
    assert.ok(!result.isHasValid, '应该没有无效的表达式')
  })

  let test3 = `index ? 'red' : index ? ...list : ' blue'`
  it(test3, async function () {
    let expression = test3,
      result = await textParse(expression)
    assert.strictEqual(result.classes.length, 0, '提取的class长度应该是0')
    assert.ok(result.isHasValid, '应该有无效的表达式')
  })

  let test4 = `object`
  it(test4, async function () {
    let expression = test4,
      result = await textParse(expression)
    assert.strictEqual(result.classes.length, 0, '提取的class长度应该是0')
    assert.ok(result.isHasValid, '应该有无效的表达式')
  })

  let test5 = `index ? 'red' : index ? 'yellow' : ' '`
  it(test5, async function () {
    let expression = test5,
      result = await textParse(expression)
    assert.equal(result.classes.length, 3, '提取的class长度应该是3')
    assert.strictEqual(result.classes[result.classes.length - 1], '', '最后一个class应该是空')
    assert.ok(!result.isHasValid, '应该没有无效的表达式')
  })

  let test6 = `index ? 'red' : index ? index : ' '`
  it(test6, async function () {
    let expression = test6,
      result = await textParse(expression)
    assert.equal(result.classes.length, 2, '提取的class长度应该是2')
    assert.strictEqual(result.classes[result.classes.length - 1], '', '最后一个class应该是空')
    assert.ok(result.isHasValid, '应该有无效的表达式')
  })

  let test7 = `(item.type == 'weui-dialog__btn_primary' && btn_disabled) ? 'red' : index ? 'green' : ' '`
  it(test7, async function () {
    let expression = test7,
      result = await textParse(expression)
    assert.equal(result.classes.length, 3, '提取的class长度应该是3')
    assert.strictEqual(result.classes[result.classes.length - 1], '', '最后一个class应该是空')
    assert.ok(!result.isHasValid, '应该没有无效的表达式')
  })

  let test8 = ` index == 'index' && 'yellow' && 'green' `
  it(test8, async function(){
    let expression = test8,
      result = await textParse(expression)
    assert.ok(!result.isHasValid, '没有无效的表达式')
    assert.ok(result.classes.length == 2, '应该提取到2个class')
  })

  let test9 = ` index == 'index' || index == '123' && 'green' `
  it(test9, async function () {
    let expression = test9,
      result = await textParse(expression)
    assert.ok(!result.isHasValid, '没有无效的表达式')
    assert.ok(result.classes.length == 1, '应该提取到1个class')
  })
})
