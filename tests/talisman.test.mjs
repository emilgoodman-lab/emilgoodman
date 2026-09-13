import test from 'node:test';
import assert from 'node:assert/strict';
import {AbyssalWorld as Original,STEP as originalStep} from '../public/experiments/abyssal/v1/physics.mjs';
import {AbyssalWorld,STEP} from '../public/experiments/abyssal/v2/physics.mjs';
import {CreatureAudio as OriginalAudio} from '../public/experiments/abyssal/v1/audio.mjs';
import {CreatureAudio} from '../public/experiments/abyssal/v2/audio.mjs';
test('collage uses the exact preserved Abyssal simulation and sound',()=>{assert.equal(AbyssalWorld,Original);assert.equal(STEP,originalStep);assert.equal(CreatureAudio,OriginalAudio);});
