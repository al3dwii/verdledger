#!/usr/bin/env node
import { Command } from 'commander';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const program = new Command();
program.name('verd').description('VerdLedger CLI').version('0.1.0');

program
  .command('push <file>')
  .description('Push a local plan result to the ledger')
  .action(async (file) => {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '');
    await supabase.from('savings_event').insert(data);
    console.log('Pushed events to ledger');
  });

program.parse(process.argv);
