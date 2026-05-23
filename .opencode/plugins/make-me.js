/**
 * Make Me plugin for OpenCode.ai
 *
 * Auto-registers the skills directory via the config hook so OpenCode
 * discovers make-me-opencode (and make-me-claude) without manual config edits.
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const MakeMePlugin = async ({ client, directory }) => {
  // Resolve the skills/ directory relative to this plugin file:
  // .opencode/plugins/make-me.js → ../../skills/
  const skillsDir = path.resolve(__dirname, '../../skills');

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },
  };
};

export default MakeMePlugin;
