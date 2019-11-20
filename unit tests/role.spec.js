
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
