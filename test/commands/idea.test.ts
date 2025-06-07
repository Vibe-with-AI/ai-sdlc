import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('idea', () => {
  it('runs idea cmd', async () => {
    const {stdout} = await runCommand('idea')
    expect(stdout).to.contain('hello world')
  })

  it('runs idea --name oclif', async () => {
    const {stdout} = await runCommand('idea --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
