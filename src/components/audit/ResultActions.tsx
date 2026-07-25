import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Check, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AuditResult } from '@/types/audit';
import { copyToClipboard, downloadJson, auditFilename } from '@/utils/audit';
import { toast } from '@/hooks/use-toast-store';

interface ResultActionsProps {
  result: AuditResult;
}

export function ResultActions({ result }: ResultActionsProps) {
  const [copied, setCopied] = useState(false);

  const payload = {
    success: true,
    url: result.url,
    status: result.status,
    reachable: result.reachable,
    responseTime: result.responseTime,
    title: result.title,
    cached: result.cached,
    timestamp: result.timestamp,
    requestId: result.requestId,
  };

  async function handleCopy() {
    const ok = await copyToClipboard(JSON.stringify(payload, null, 2));
    if (ok) {
      setCopied(true);
      toast.success('Copied to clipboard', 'Audit JSON is on your clipboard.');
      setTimeout(() => setCopied(false), 1800);
    } else {
      toast.error('Copy failed', 'Clipboard permission was denied.');
    }
  }

  function handleDownload() {
    downloadJson(auditFilename(result.url), payload);
    toast.success('Report downloaded', 'Your audit report has been saved.');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-wrap items-center gap-2"
    >
      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied' : 'Copy JSON'}
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
        <Download className="h-4 w-4" />
        Download report
      </Button>
      <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <FileJson className="h-3.5 w-3.5" />
        JSON format
      </span>
    </motion.div>
  );
}
