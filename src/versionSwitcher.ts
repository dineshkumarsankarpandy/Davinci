import { useState, useEffect } from 'react';
import { WebsiteData } from './types/type';
import { parse_title_and_version } from '@/lib/utils';

export const useVersionSwitcher = (
    website: WebsiteData,
    generatedWebsites: WebsiteData[],
    onActivate: (id: string) => void,
    groupId?: string | null,
    onGroupSelect?: (groupId: string) => void
) => {
    const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
    const [versionGroup, setVersionGroup] = useState<WebsiteData[]>([]);

    useEffect(() => {
        const [baseTitle] = parse_title_and_version(website.title);
        const versions = generatedWebsites.filter(w => {
            const [wBaseTitle] = parse_title_and_version(w.title);
            return (
                wBaseTitle === baseTitle &&
                w.groupId === website.groupId &&
                w.pageName === website.pageName
            );
        });

        versions.sort((a, b) => {
            const versionA = parse_title_and_version(a.title)[1] ?? 0;
            const versionB = parse_title_and_version(b.title)[1] ?? 0;
            return versionA - versionB;
        });

        if (JSON.stringify(versions.map(v => v.id)) !== JSON.stringify(versionGroup.map(v => v.id))) {
            setVersionGroup(versions);
        }

        const index = versions.findIndex(w => w.id === website.id);
        if (index !== -1 && index !== currentVersionIndex) {
            setCurrentVersionIndex(index);
        }
    }, [
        website.id,
        website.title,
        website.groupId,
        website.pageName,
        generatedWebsites,
        versionGroup,
        currentVersionIndex,
    ]);

    const handleNextVersion = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentVersionIndex < versionGroup.length - 1) {
            const newIndex = currentVersionIndex + 1;
            setCurrentVersionIndex(newIndex);
            onActivate(versionGroup[newIndex].id);
            if (groupId && onGroupSelect) {
                onGroupSelect(groupId);
            }
        }
    };

    const handlePrevVersion = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentVersionIndex > 0) {
            const newIndex = currentVersionIndex - 1;
            setCurrentVersionIndex(newIndex);
            onActivate(versionGroup[newIndex].id);
            if (groupId && onGroupSelect) {
                onGroupSelect(groupId);
            }
        }
    };

    return {
        currentVersionIndex,
        versionGroup,
        handleNextVersion,
        handlePrevVersion,
    };
};