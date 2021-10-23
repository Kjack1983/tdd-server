import sinon from 'sinon';
import request from 'supertest';
import { expect } from 'chai';
import db from './db';
import { app } from  './server';
import { async } from 'regenerator-runtime';

describe('GET /users/:username', () => {
    it('Send the correct respond when a user with a username is found', async() => {
        // test doubles. sinon and supertest to test our server end points.
        // we dont want our code to communicate with out mongodb because this can slow down 
        // our tests (this is where test doubles are handy)
        const fakeData = {
            id: '123',
            username: 'abc',
            email: 'abc@gmail.com',
        }

        // test double on getUserByusername function
        const stub = sinon
            .stub(db, 'getUserByUsername')
            .resolves(fakeData);

        // supertest
        await request(app).get('/users/abc')
            .expect(200)
            .expect('Content-Type', /json/) //expected type
            .expect(fakeData) //response body

        expect(stub.getCall(0).args[0]).to.equal('abc');
        stub.restore();

    });

    it('sends the correct response when there is an error', async() => {
        const fakeError = {
            message: 'something went wrong'
        }
        const stub = sinon
            .stub(db, 'getUserByUsername')
            .throws(fakeError)

        await request(app).get('/users/abc')
            .expect(500)
            .expect('Content-Type', /json/)
            .expect(fakeError)

        stub.restore();    
    })

    it('returns the appropriate response when the user is not ', async() => {
        const stub = sinon.stub(db, 'getUserByUsername')
            .resolves(null);

        await request(app).get('/users/def')
            .expect(404)
        
        stub.restore();
    });
})