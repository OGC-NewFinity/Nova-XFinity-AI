/**
 * Draft Management Utilities
 * Handles saving, loading, and managing article drafts
 */

export const saveDraft = (config, metadata, sections, ctaContent) => {
  const currentDrafts = JSON.parse(localStorage.getItem('finity_drafts') || '[]');
  const newDraft = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    title: metadata?.seoTitle || config.topic || 'Untitled Post',
    config,
    metadata,
    sections,
    ctaContent
  };
  
  const updatedDrafts = [
    newDraft,
    ...currentDrafts.filter(d => 
      d.title !== newDraft.title || (Date.now() - d.id > 3600000)
    )
  ].slice(0, 10);
  
  localStorage.setItem('finity_drafts', JSON.stringify(updatedDrafts));
  return updatedDrafts;
};

export const loadDrafts = () => {
  return JSON.parse(localStorage.getItem('finity_drafts') || '[]');
};

export const deleteDraft = (draftId) => {
  const currentDrafts = loadDrafts();
  const updatedDrafts = currentDrafts.filter(d => d.id !== draftId);
  localStorage.setItem('finity_drafts', JSON.stringify(updatedDrafts));
  return updatedDrafts;
};
