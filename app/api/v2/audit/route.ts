import type { AuditReportV2 } from '@/lib/schemas'
import { POST as v1Post } from '@/app/api/v1/audit/route'
import { buildAuditReportV2 } from '@/lib/intelligence-v2'

export const runtime = 'nodejs'

void buildAuditReportV2
type _Contract = AuditReportV2
const version = '2'
void version

export const POST = v1Post
