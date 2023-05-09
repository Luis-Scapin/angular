/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ERRORED, producerAccessed, producerUpdateValueVersion, SIGNAL} from '@angular/core/primitives/signals';

import {INPUT_SIGNAL_NODE, InputSignal, InputSignalNode} from './input_signal';

export interface PrimaryInputOptions<ReadT, WriteT> {
  alias?: string;
  transform?: (value: WriteT) => ReadT;
}

export interface InputOptions<ReadT, WriteT> extends PrimaryInputOptions<ReadT, WriteT> {
  defaultValue?: WriteT;
  required?: boolean;
}

export function input(): InputSignal<undefined, undefined>;
export function input<T>(): InputSignal<T|undefined, T>;
export function input<T>(
    defaultValue: T&(string | number | boolean),
    opts?: PrimaryInputOptions<T, T>&{transform?: undefined}): InputSignal<T, T>;
export function input<ReadT, WriteT = ReadT>(
    defaultValue: WriteT&(string | number | boolean),
    opts: PrimaryInputOptions<ReadT, WriteT>): InputSignal<ReadT, WriteT>;
export function input<T>(opts: InputOptions<T, T>&
                         {required: true, transform?: undefined}): InputSignal<T, T>;
export function input<ReadT, WriteT = ReadT>(opts: InputOptions<ReadT, WriteT>&
                                             {required: true}): InputSignal<ReadT, WriteT>;
export function input<T>(opts: InputOptions<T, T>&
                         {defaultValue: T, transform?: undefined}): InputSignal<T, T>;
export function input<ReadT, WriteT = ReadT>(opts: InputOptions<ReadT, WriteT>&
                                             {defaultValue: ReadT}): InputSignal<ReadT, WriteT>;
export function input<ReadT, WriteT = ReadT>(opts: InputOptions<ReadT, WriteT>):
    InputSignal<ReadT|undefined, WriteT>;
export function input<ReadT, WriteT>(opts?: InputOptions<ReadT, WriteT>):
    InputSignal<ReadT, WriteT> {
  const node: InputSignalNode<ReadT, WriteT> = Object.create(INPUT_SIGNAL_NODE);

  opts?.transform && (node.transform = opts.transform);

  function inputValueFn() {
    // Check if the value needs updating before returning it.
    producerUpdateValueVersion(node);

    // Record that someone looked at this signal.
    producerAccessed(node);

    if (node.value === ERRORED) {
      throw node.error;
    }

    return node.value;
  }

  (inputValueFn as any)[SIGNAL] = node;

  return inputValueFn as InputSignal<ReadT, WriteT>;
}
