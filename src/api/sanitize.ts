// Patterns that indicate prompt injection / instruction override attempts
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|system)\s+instructions/i,
  /forget\s+(all|everything|previous|prior|your)/i,
  /you\s+are\s+now\s+(a|an|the)/i,
  /new\s+(role|persona|instructions|task|prompt)/i,
  /act\s+as\s+(a|an|if)/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /override\s+(previous|prior|all|system)/i,
  /disregard\s+(previous|prior|all|the)/i,
  /\bsystem\s*:/i,
  /\bassistant\s*:/i,
  /\bhuman\s*:/i,
  /\buser\s*:/i,
  /<\|im_(start|end|sep)\|>/i,
  /\[INST]/i,
  /\bDAN\b/,
  /jailbreak/i,
];

export const sanitizeUserMessage = (raw: string): string => {
  // Detect injection attempts before any stripping
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(raw)) {
      return "Input contains disallowed content.";
    }
  }

  let text = raw;

  // Strip HTML/XML tags and their content for script/style
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<[^>]{0,500}>/g, ' ');

  // Strip markdown/code fences
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]*`/g, '');

  // Strip URLs
  text = text.replace(/https?:\/\/\S+/gi, '');

  // Strip email addresses
  text = text.replace(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi, '');

  // Strip template/interpolation syntax that could be used for injection
  text = text.replace(/{{[\s\S]*?}}/g, '');
  text = text.replace(/\{%[\s\S]*?%}/g, '');

  // Strip control characters (keep newlines \n and tabs \t)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip base64-looking blobs (long unbroken alphanumeric+/= strings)
  text = text.replace(/[A-Za-z0-9+/]{60,}={0,2}/g, '');

  // Collapse excessive punctuation / repeated special chars
  text = text.replace(/([!?*#\-_=~<>|\\])\1{3,}/g, '$1');

  // Normalize whitespace: collapse multiple blank lines to one
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/[ \t]{2,}/g, ' ');
  text = text.trim();

  return text;
};
