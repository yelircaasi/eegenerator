# eegenerator

Single-page webapp to create an EEG report from a template. Supports .docx downloads.

## TODO

- [ ] figure out how to use nix in github workflow
  - Settings > Pages > Build and Deployment > Source: Github Actions > Deploy from a branch > [Static HTML](https://github.com/yelircaasi/eegenerator/new/main?filename=.github%2Fworkflows%2Fstatic.yml&pages_workflow_template=pages%2Fstatic)
  - set up flakehub for use with github
- [ ] fold anything of value in tmp.ts into main.ts: `code --diff src/main.ts ../playground/eegenerator-scratch/scratch/tmp.ts`
- [ ] compare compiled main.js to original: `code --diff main.js ../playground/eegenerator-scratch/scratch/tmp.js`
- [ ] consider alternative ways to deal with dependencies
- [ ] go through brainstorm notes and jot down anything of value
- [ ] move outputs to dist/ directory -> fix Github CI to take dist/ directory
- [ ] use live server to get features back to what they were before ts rewrite
- [ ] remove unit section and case number
