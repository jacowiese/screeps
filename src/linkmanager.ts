export class LinkManager {

    public update(linkNodes: Array<LinkNode>): void {

        if (linkNodes.length > 0) {
            linkNodes.forEach((node: LinkNode) => {

                let targetLink: StructureLink | null = Game.getObjectById<StructureLink>(node.target);

                if (targetLink != null && targetLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {

                    if (node.source.length > 0) {

                        node.source.forEach((srcId: string) => {

                            let srcLink: StructureLink | null = Game.getObjectById<StructureLink>(srcId);
                            if (srcLink != null && srcLink.cooldown == 0 && srcLink.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {

                                let energy: number = srcLink.store.energy;
                                let result: ScreepsReturnCode = srcLink.transferEnergy(targetLink as StructureLink, targetLink?.store.getFreeCapacity(RESOURCE_ENERGY));
                                console.log("LinkStructure transfer result: " + result);

                                if (result == OK) {
                                    console.log("Link: transfer from " + srcId + " to " + node.target + "Cost: " + energy * 0.003);
                                } else if (result == ERR_FULL) {
                                    console.log("Link full: " + node.target);
                                } else if (result == ERR_NOT_ENOUGH_RESOURCES) {
                                    console.log("Link: Deposit some resources to transfer!");
                                } else if (result == ERR_TIRED) {
                                    console.log("Link: Link structure is tired!");
                                }
                            }
                        });
                    }
                };
            });
        }
    }

}
