import fs from 'fs';
import path from 'path';
import { Channel, VideoTemplate, ChannelBranding, LanguageConfig, AudioProfile } from '../../../remotion/types/index.js';
import { defaultChannels } from './defaultChannels.js';

export class ChannelManager {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
    this.initDefaults();
  }

  private initDefaults(): void {
    for (const ch of defaultChannels) {
      const chDir = path.join(this.baseDir, ch.id);
      if (!fs.existsSync(chDir)) {
        this.saveChannel(ch);
      }
    }
  }

  public listChannels(): { id: string; name: string; description: string; avatarUrl: string }[] {
    const dirs = fs.readdirSync(this.baseDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    const validList: { id: string; name: string; description: string; avatarUrl: string }[] = [];
    for (const id of dirs) {
      try {
        const ch = this.getChannel(id);
        if (ch && ch.id) {
          validList.push({
            id: ch.id,
            name: ch.name || id,
            description: ch.description || '',
            avatarUrl: ch.branding?.identity?.avatarUrl || ''
          });
        }
      } catch (err) {
        console.warn(`[ChannelManager] Skipping invalid channel dir ${id}:`, err);
      }
    }

    if (validList.length === 0) {
      this.initDefaults();
      for (const ch of defaultChannels) {
        validList.push({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          avatarUrl: ch.branding?.identity?.avatarUrl || ''
        });
      }
    }

    return validList;
  }

  public getChannel(id: string): Channel {
    const chDir = path.join(this.baseDir, id);
    const channelJsonPath = path.join(chDir, 'channel.json');

    if (!fs.existsSync(chDir) || !fs.existsSync(channelJsonPath)) {
      const found = defaultChannels.find(c => c.id === id);
      if (found) {
        this.saveChannel(found);
        return found;
      }
      if (defaultChannels.length > 0) {
        console.warn(`[ChannelManager] Channel ${id} not found, falling back to defaultChannel[0]: ${defaultChannels[0].id}`);
        return defaultChannels[0];
      }
      throw new Error(`Channel ${id} not found`);
    }

    try {
      const channelMeta = JSON.parse(fs.readFileSync(channelJsonPath, 'utf-8'));
      const fallbackDef = defaultChannels.find(c => c.id === id) || defaultChannels[0];

      const brandingPath = path.join(chDir, 'branding.json');
      const branding: ChannelBranding = fs.existsSync(brandingPath)
        ? JSON.parse(fs.readFileSync(brandingPath, 'utf-8'))
        : fallbackDef.branding;

      const configViPath = path.join(chDir, 'config_vi.json');
      const configVi: LanguageConfig = fs.existsSync(configViPath)
        ? JSON.parse(fs.readFileSync(configViPath, 'utf-8'))
        : fallbackDef.languages.vi;

      const configEnPath = path.join(chDir, 'config_en.json');
      const configEn: LanguageConfig = fs.existsSync(configEnPath)
        ? JSON.parse(fs.readFileSync(configEnPath, 'utf-8'))
        : fallbackDef.languages.en;

      const audioPath = path.join(chDir, 'audio.json');
      const audio: AudioProfile = fs.existsSync(audioPath)
        ? JSON.parse(fs.readFileSync(audioPath, 'utf-8'))
        : fallbackDef.audio;

      // Load templates
      const tmplDir = path.join(chDir, 'templates');
      const templates: VideoTemplate[] = [];
      if (fs.existsSync(tmplDir)) {
        const tmplFiles = fs.readdirSync(tmplDir).filter(f => f.endsWith('.json'));
        for (const tf of tmplFiles) {
          try {
            const tData = JSON.parse(fs.readFileSync(path.join(tmplDir, tf), 'utf-8'));
            templates.push(tData);
          } catch (e) {
            console.error(`Error reading template file ${tf}:`, e);
          }
        }
      }

      if (templates.length === 0 && fallbackDef.templates) {
        templates.push(...fallbackDef.templates);
      }

      return {
        id: channelMeta.id || id,
        name: channelMeta.name || fallbackDef.name,
        description: channelMeta.description ?? fallbackDef.description,
        createdAt: channelMeta.createdAt || new Date().toISOString(),
        updatedAt: channelMeta.updatedAt || new Date().toISOString(),
        branding,
        languages: {
          vi: configVi,
          en: configEn
        },
        audio,
        activeTemplateId: channelMeta.activeTemplateId || (templates[0]?.id ?? 'classic-stacked'),
        templates
      };
    } catch (err) {
      console.warn(`[ChannelManager] Error reading channel ${id}, recovering with default:`, err);
      const def = defaultChannels.find(c => c.id === id) || defaultChannels[0];
      this.saveChannel(def);
      return def;
    }
  }

  public saveChannel(channel: Channel): void {
    const chDir = path.join(this.baseDir, channel.id);
    const tmplDir = path.join(chDir, 'templates');
    const quizDir = path.join(chDir, 'quizzes');

    if (!fs.existsSync(chDir)) fs.mkdirSync(chDir, { recursive: true });
    if (!fs.existsSync(tmplDir)) fs.mkdirSync(tmplDir, { recursive: true });
    if (!fs.existsSync(quizDir)) fs.mkdirSync(quizDir, { recursive: true });

    channel.updatedAt = new Date().toISOString();

    fs.writeFileSync(
      path.join(chDir, 'channel.json'),
      JSON.stringify({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
        activeTemplateId: channel.activeTemplateId
      }, null, 2),
      'utf-8'
    );

    fs.writeFileSync(path.join(chDir, 'branding.json'), JSON.stringify(channel.branding, null, 2), 'utf-8');
    fs.writeFileSync(path.join(chDir, 'config_vi.json'), JSON.stringify(channel.languages.vi, null, 2), 'utf-8');
    fs.writeFileSync(path.join(chDir, 'config_en.json'), JSON.stringify(channel.languages.en, null, 2), 'utf-8');
    fs.writeFileSync(path.join(chDir, 'audio.json'), JSON.stringify(channel.audio, null, 2), 'utf-8');

    // Save templates
    if (channel.templates && channel.templates.length > 0) {
      for (const tmpl of channel.templates) {
        fs.writeFileSync(path.join(tmplDir, `${tmpl.id}.json`), JSON.stringify(tmpl, null, 2), 'utf-8');
      }
    }
  }

  public duplicateChannel(sourceId: string, newId: string, newName: string): Channel {
    const source = this.getChannel(sourceId);
    const duplicate: Channel = {
      ...source,
      id: newId,
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveChannel(duplicate);
    return duplicate;
  }

  public resetChannel(id: string): Channel {
    const def = defaultChannels.find(c => c.id === id);
    if (!def) throw new Error(`Cannot reset non-default channel ${id}`);
    this.saveChannel(def);
    return def;
  }

  public deleteChannel(id: string): void {
    const chDir = path.join(this.baseDir, id);
    if (fs.existsSync(chDir)) {
      fs.rmSync(chDir, { recursive: true, force: true });
    }
  }
}
