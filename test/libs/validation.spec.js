'use strict'

const chai = require('chai')
const path = require('path')

let expect = chai.expect

const rootpath = path.resolve(__dirname, '../../')
global.loadLib = (filename) => require(rootpath + '/app/libs/' + filename.toLowerCase() + '.js')(rootpath)
let lib = require(rootpath + '/app/libs/validation.js')(rootpath)

chai.should();


// TEST START HERE!
describe('Validation phoneNumber', () => {

    let phone_number_case = [
        {
            "param": "0817222333",
            "expect": true
        },
        {
            "param": "+62817222333",
            "expect": true
        },
        {
            "param": "a281a24233f8",
            "expect": false
        },
        {
            "param": "f827hdf72h28",
            "expect": false
        },
        {
            "param": "!@#$%^&*()0817!@#$%^&*()999888!@#$%^&*()",
            "expect": true
        },
        {
            "param": "+628181",
            "expect": false
        },
        {
            "param": "a018181%7h8",
            "expect": false
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

describe('Validation isValidEmail', () => {

    let email_case = [
        {
            "param": "loremipsum@gmail.com",
            "expect": true
        },
        {
            "param": "lorem.ipsum@gmail.com",
            "expect": true
        },
        {
            "param": "lorem+ipsum@gmail.com",
            "expect": true
        },
        {
            "param": "lor.em.ipsum@gmail.com",
            "expect": true
        },
        {
            "param": "lor..emipsum@gmail.com",
            "expect": false
        },
        {
            "param": "loremipsum@mailinator.com",
            "expect": false
        },
        {
            "param": "loremipsum@yopmail.com",
            "expect": false
        },
        {
            "param": "loremipsumyopmail.com",
            "expect": false
        },
        {
            "param": "hallo@mail@mail.com",
            "expect": false
        },
        {
            "param": "hallo@mail",
            "expect": false
        },
    ]
    for(let i = 0, len = email_case.length; i < len; i++) {
        let row = email_case[i]
        it('isValidEmail passing ' + row.param + ' expect ' + row.expect, () => {
            let result = lib.isValidEmail(row.param)
            expect(result).to.equal(row.expect)
        })
    }

})