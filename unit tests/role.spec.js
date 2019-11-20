
'use strict'

const Role = require('../modules/role.js')

describe('generateRoles', () => {
	test('Admin and user', async done => {
		expect.assertions(3)

		const role = await new Role()

		expect(await role.generateRoles('user', 'admin'))
			.toBe(true)

		expect(await role.getRoleByID(1))
			.toMatchObject(
				{
					ID: 1,
					role: 'user'
				}
			)

		expect(await role.getRoleByID(2))
			.toMatchObject(
				{
					ID: 2,
					role: 'admin'
				}
			)

		done()
	})
})

describe('getRoleByID()', () => {
	test('Valid roleID', async done => {
		expect.assertions(1)

		const role = await new Role()

		expect(await role.getRoleByID(1).toMatchObject({
			ID: 1,
			role: 'user'
		}))
		done()
	})

	test('Error if roleID null', async done => {
		expect.assertions(1)

		const role = await new Role()

		await expect( role.getRoleByID(null) )
			.rejects.toEqual(Error('Must supply roleID'))
		done()
	})

	test('Error if roleID undefined', async done => {
		expect.assertions(1)

		const role = await new Role()

		await expect( role.getRoleByID(undefined) )
			.rejects.toEqual(Error('Must supply roleID'))
		done()
	})

	test('Error if roleID NaN', async done => {
		expect.assertions(1)

		const role = await new Role()

		await expect( role.getRoleByID('Not a number') )
			.rejects.toEqual(Error('Must supply roleID'))
		done()
	})

	test('Error if role does not exist', async done => {
		expect.assertions(1)

		const role = await new Role()

		await expect( role.getRoleByID(5) )
			.rejects.toEqual(Error('Role not found'))
		done()
	})
})
