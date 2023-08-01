import { ApplicationBoardForm } from '@masknet/shared'
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'

export interface ApplicationsPageProps {}

export default function ApplicationsPage(props: ApplicationsPageProps) {
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="Applications" />

                <div className="bg-white p-5">
                    <div className="border rounded-lg">
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <ApplicationBoardForm allPersonas={[]} personaAgainstSNSConnectStatusLoading={false} />
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
}
