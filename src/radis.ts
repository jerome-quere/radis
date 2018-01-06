import * as utils from './utils'
import { Module } from './Module'
import { Injector } from './Injector'

export const radis = {
  module: (moduleName: string, dependencies: Module[] = []): Module => {
    if (!utils.isModuleName(moduleName)) {
      throw new Error(`Invalid module name ${moduleName}. Module must match ${utils.moduleNameRegex.toString()}`)
    }

    return new Module(moduleName, dependencies)
  },

  Module,
  Injector
}
