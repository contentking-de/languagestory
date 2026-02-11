'use client';

import useSWR from 'swr';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { customerPortalAction } from '@/lib/payments/actions';
import {
  Receipt,
  Download,
  ExternalLink,
  CreditCard,
  Calendar,
  Loader2,
  FileText,
} from 'lucide-react';
import type { InvoiceData } from '@/lib/payments/stripe';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BillingData {
  invoices: InvoiceData[];
  upcomingInvoice: InvoiceData | null;
  planName: string | null;
  subscriptionStatus: string | null;
}

function formatCurrency(amountInCents: number, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}

function formatDate(unixTimestamp: number) {
  return new Date(unixTimestamp * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;

  const config: Record<string, { label: string; className: string }> = {
    paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
    open: { label: 'Open', className: 'bg-yellow-100 text-yellow-800' },
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
    uncollectible: { label: 'Uncollectible', className: 'bg-red-100 text-red-800' },
    void: { label: 'Void', className: 'bg-gray-100 text-gray-500' },
    upcoming: { label: 'Upcoming', className: 'bg-blue-100 text-blue-800' },
  };

  const { label, className } = config[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return <Badge className={className}>{label}</Badge>;
}

function InvoiceRow({ invoice }: { invoice: InvoiceData }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4 min-w-0">
        <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
          <FileText className="h-5 w-5 text-gray-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm text-gray-900 truncate">
              {invoice.number || 'Invoice'}
            </p>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {invoice.planName || 'Subscription'}
            {' · '}
            {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <p className="font-semibold text-sm text-gray-900 whitespace-nowrap">
          {formatCurrency(invoice.amountPaid || invoice.amountDue, invoice.currency)}
        </p>
        <div className="flex gap-1">
          {invoice.invoicePdf && (
            <a
              href={invoice.invoicePdf}
              target="_blank"
              rel="noopener noreferrer"
              title="Download PDF"
            >
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Download className="h-4 w-4" />
              </Button>
            </a>
          )}
          {invoice.hostedInvoiceUrl && (
            <a
              href={invoice.hostedInvoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View invoice online"
            >
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { data, isLoading } = useSWR<BillingData>('/api/billing', fetcher);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Billing</h1>

      {/* Current Plan Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-medium text-gray-900">
                  {data?.planName || 'No active plan'}
                </p>
                <p className="text-sm text-gray-500">
                  {data?.subscriptionStatus === 'active'
                    ? 'Active subscription'
                    : data?.subscriptionStatus === 'trialing'
                    ? 'Trial period'
                    : 'No active subscription'}
                </p>
              </div>
              {data?.subscriptionStatus === 'active' && (
                <form action={customerPortalAction}>
                  <Button type="submit" variant="outline" size="sm">
                    Manage Subscription
                  </Button>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Invoice */}
      {data?.upcomingInvoice && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Payment
            </CardTitle>
            <CardDescription>
              Your next invoice will be generated on {formatDate(data.upcomingInvoice.periodEnd)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {data.upcomingInvoice.planName || 'Subscription'}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {formatCurrency(data.upcomingInvoice.amountDue, data.upcomingInvoice.currency)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoice History
          </CardTitle>
          <CardDescription>
            Download your past invoices as PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading invoices...
            </div>
          ) : !data?.invoices || data.invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No invoices yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Invoices will appear here after your first payment
              </p>
            </div>
          ) : (
            <div>
              {data.invoices.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
