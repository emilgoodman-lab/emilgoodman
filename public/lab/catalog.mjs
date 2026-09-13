// The single ordered catalog. Append a record to add a work; keep published IDs stable.
export const works=Object.freeze([
 {id:'organism',title:'Organism',edition:'Character Field',description:'A layered organic sculpture of living glyphs.',path:'/experiments/organic/v4/',input:'MOUSE · TOUCH · HAND',audio:false},
 {id:'chain-choir',title:'Chain Choir',edition:'Touch Voices',description:'Sixteen suspended chains. Touch becomes sound.',path:'/experiments/chimes/v3/',input:'MOUSE · TOUCH · HAND',audio:true},
 {id:'abyssal',title:'Abyssal',edition:'Specimen 06',description:'A mechanical creature in a fluid habitat.',path:'/experiments/abyssal/v1/',input:'MOUSE · TOUCH · HAND',audio:true},
 {id:'rotor',title:'Rotor',edition:'Glyph Resonator',description:'Concentric glyph rings. Four fields and infinite reflections.',path:'/experiments/rotor/v1/',input:'MOUSE · TOUCH · HAND',audio:true},
 {id:'silt',title:'Silt II',edition:'Dynamic Granular Matter',description:'Two thousand colliding glyph grains. Stir, suspend, release.',path:'/experiments/silt/v2/',input:'MOUSE · TOUCH · HAND',audio:true},
 {id:'weave',title:'Weave II',edition:'Elastic Resonance',description:'A glyph fabric whose visual and sonic sine rise together.',path:'/experiments/weave/v2/',input:'MOUSE · TOUCH · HAND',audio:true},
 {id:'strata',title:'Strata IV',edition:'Exclusion Ring',description:'Five thousand glyph grains flow around an impenetrable moving circular boundary.',path:'/experiments/strata/v4/',input:'MOUSE · TOUCH · HAND',audio:true},
 {id:'aerosol',title:'Aerosol I',edition:'Faulty Nozzle',description:'Layered ASCII paint, broken spray and drying glyph drips on white.',path:'/experiments/aerosol/v1/',input:'MOUSE · TOUCH · HAND',audio:true}
]);
export const workURL=id=>`/play/?work=${encodeURIComponent(id)}`;
export function navigation(id,catalog=works){const index=catalog.findIndex(work=>work.id===id);if(index<0||!catalog.length)return null;return {work:catalog[index],index,total:catalog.length,previous:catalog[(index-1+catalog.length)%catalog.length],next:catalog[(index+1)%catalog.length]};}
