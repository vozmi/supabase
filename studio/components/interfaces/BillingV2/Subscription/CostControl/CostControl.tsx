import { useParams } from 'common'
import ShimmeringLoader from 'components/ui/ShimmeringLoader'
import { useProjectSubscriptionV2Query } from 'data/subscriptions/project-subscription-v2-query'
import { BASE_PATH } from 'lib/constants'
import Image from 'next/image'
import { useSubscriptionPageStateSnapshot } from 'state/subscription-page'
import { Alert, Button, IconExternalLink } from 'ui'
import SpendCapSidePanel from './SpendCapSidePanel'
import Link from 'next/link'
import ProjectUpdateDisabledTooltip from '../../ProjectUpdateDisabledTooltip'
import { useFlag } from 'hooks'

export interface CostControlProps {}

const CostControl = ({}: CostControlProps) => {
  const { ref: projectRef } = useParams()
  const snap = useSubscriptionPageStateSnapshot()
  const projectUpdateDisabled = useFlag('disableProjectCreationAndUpdate')

  const { data: subscription, isLoading } = useProjectSubscriptionV2Query({ projectRef })

  const currentPlan = subscription?.plan
  const isUsageBillingEnabled = subscription?.usage_billing_enabled ?? false

  const canChangeTier = !projectUpdateDisabled && !['team', 'enterprise'].includes(currentPlan?.id || '')

  return (
    <>
      <div className="grid grid-cols-12 gap-6" id="cost-control">
        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-16">
            <div className="space-y-6">
              <p className="text-base">Cost control</p>
              <p className="text-sm text-scale-1000">
                Control whether to allow over-usage and avoid surprise bills
              </p>
              <div className="space-y-2">
                <p className="text-sm text-scale-1100">More information</p>
                <div>
                  <Link href="https://supabase.com/docs/guides/platform/spend-cap">
                    <a target="_blank" rel="noreferrer">
                      <div className="flex items-center space-x-2 opacity-50 hover:opacity-100 transition">
                        <p className="text-sm">About spend cap</p>
                        <IconExternalLink size={16} strokeWidth={1.5} />
                      </div>
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="col-span-12 lg:col-span-7 space-y-2">
            <ShimmeringLoader />
            <ShimmeringLoader className="w-3/4" />
            <ShimmeringLoader className="w-1/2" />
          </div>
        ) : (
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {['team', 'enterprise'].includes(currentPlan?.id || '') ? (
              <Alert
                withIcon
                variant="info"
                title={`You will be charged for any additional usage on the ${
                  currentPlan?.name || ''
                } plan`}
              >
                {currentPlan?.name || ''} plan requires you to have spend cap off at all times. Your
                project will never become unresponsive. Only when your included usage is exceeded
                will you be charged for any additional usage
              </Alert>
            ) : (
              <p className="text-sm text-scale-1000">
                You can control whether your project is charged for additional usage beyond the
                included quota of your subscription plan. If you need to go beyond the included
                quota, simply switch off your spend cap to pay for additional usage.
              </p>
            )}

            <div className="flex space-x-6">
              <div>
                <div className="rounded-md w-[160px] h-[96px] shadow">
                  <Image
                    alt="Spend cap"
                    width={160}
                    height={96}
                    src={
                      isUsageBillingEnabled
                        ? `${BASE_PATH}/img/spend-cap-off.svg`
                        : `${BASE_PATH}/img/spend-cap-on.svg`
                    }
                  />
                </div>
              </div>
              <div>
                <p className="mb-1">
                  Spend cap is {isUsageBillingEnabled ? 'disabled' : 'enabled'}
                </p>
                <p className="text-sm text-scale-1000">
                  {isUsageBillingEnabled
                    ? 'You will be charged for any usage above the included quota'
                    : 'You will never be charged any extra for usage. However, your project could become unresponsive or enter read only mode if you exceed the included quota'}
                </p>
                {isUsageBillingEnabled && (
                  <p className="text-sm text-scale-1000 mt-1">
                    Your project will never become unresponsive. Only when your usage reaches the
                    quota limit will you be charged for any excess usage.
                  </p>
                )}
                <ProjectUpdateDisabledTooltip projectUpdateDisabled={projectUpdateDisabled}>
                  <Button
                    type="default"
                    className="mt-4"
                    disabled={!canChangeTier}
                    onClick={() => snap.setPanelKey('costControl')}
                  >
                    Change spend cap
                  </Button>
                </ProjectUpdateDisabledTooltip>
              </div>
            </div>
          </div>
        )}
      </div>
      <SpendCapSidePanel />
    </>
  )
}

export default CostControl
