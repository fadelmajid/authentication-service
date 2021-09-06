'use strict'

const chai = require('chai')
const path = require('path')

let expect = chai.expect
const rootpath = path.resolve(__dirname, '../../')
let lib = require(rootpath + '/app/libs/general.js')(rootpath)

chai.should();



// TEST START HERE!
describe('Function showDate', () => {

    let showdate_positif = [
        {
            "param": "2018-03-02 13:43",
            "expect": "02/03/2018 13:43"
        },
        {
            "param": "2017-12-22 08:30",
            "expect": "22/12/2017 08:30"
        }
    ]

    let showdate_negatif = [
        {
            "param": "2018-03-32 13:43"
        },
        {
            "param": "2017-13-22 08:30"
        }
    ]

    for(let i = 0, len = showdate_positif.length; i < len; i++) {
        let row = showdate_positif[i]
        it('showDate date ' + row.param + ' expect ' + row.expect, () => {
            let result = lib.showDate(row.param)
            expect(result).to.equal(row.expect)
        })
    }

    for(let i = 0, len = showdate_negatif.length; i < len; i++) {
        let row = showdate_negatif[i]
        it('showDate date ' + row.param + ' expect throw error', () => {
            try {
                lib.showDate(row.param)
            } catch (e) {
                expect(() => {throw e}).to.throw()
            }
        })
    }

})
