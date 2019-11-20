
'use strict'

const Role = require('../modules/role.js')


describe('associateRole()', () => {
	test('Valid userID, user', async done => {
		expect.assertions(1)

		const role = await new Role()
		const user = role.user

		const userID = await user.register('Aaron', 'passwordIsNotGood')

		expect(await role.associateRole(1, userID)).toBe(true)

		done()
	})

	test('Valid userID, admin', async done => {
		expect.assertions(1)

		const role = await new Role()
		const user = role.user

		const userID = await user.register('Aaron', 'passwordIsNotGood')

		expect(await role.associateRole(2, userID)).toBe(true)

		done()
	})

	test('Error if userID null', async done => {
		expect.assertions(1)

		const role = await new Role()

		await expect(role.associateRole(2, null))
			.rejects.toEqual(Error('Must supply userID'))

		done()
	})

	test('Error if userID NaN', async done => {
		expect.assertions(1)

		const role = await new Role()

		await expect(role.associateRole(2, 'Not a number'))
			.rejects.toEqual(Error('Must supply userID'))

		done()
	})

	test('Error if userID undefined', async done => {
		expect.assertions(1)

		const role = await new Role()

		await expect(role.associateRole(2, undefined))
			.rejects.toEqual(Error('Must supply userID'))

		done()
	})

	test('Error if roleID null', async done => {
		expect.assertions(1)

		const role = await new Role()

		await expect(role.associateRole(null, 1))
			.rejects.toEqual(Error('Must supply roleID'))

		done()
	})

	test('Error if roleID NaN', async done => {
		expect.assertions(1)

		const role = await new Role()

		await expect(role.associateRole('Not a number', 1))
			.rejects.toEqual(Error('Must supply roleID'))

		done()
	})

	test('Error if roleID undefined', async done => {
		expect.assertions(1)

		const role = await new Role()

		await expect(role.associateRole(undefined,1))
			.rejects.toEqual(Error('Must supply roleID'))

		done()
	})
})
