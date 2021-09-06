'use strict'

const chai = require('chai')
const path = require('path')

let expect = chai.expect
const rootpath = path.resolve(__dirname, '../../')
let lib = require(rootpath + '/app/libs/sanitize.js')(rootpath)


chai.should();

// TEST START HERE!
describe('Sanitize phoneNumber', () => {

    let phone_number_case = [
        {
            "param": "0817222333",
            "expect": "+62817222333"
        },
        {
            "param": "+62817222333",
            "expect": "+62817222333"
        },
        {
            "param": "a281a24233f83",
            "expect": "+2812423383"
        },
        {
            "param": "f827hdf72h282",
            "expect": "+82772282"
        },
        {
            "param": "!@#$%^&*()0817!@#$%^&*()999888!@#$%^&*()",
            "expect": "+62817999888"
        },
    ]

    for(let i = 0, len = phone_number_case.length; i < len; i++) {
        let row = phone_number_case[i]
        it('phoneNumber passing ' + row.param + ' expect ' + row.expect, () => {
            let result = lib.phoneNumber(row.param)
            expect(result).to.equal(row.expect)
        })
    }
})
