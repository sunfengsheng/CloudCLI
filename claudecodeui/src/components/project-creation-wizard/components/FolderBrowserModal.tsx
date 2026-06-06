import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, FolderOpen, FolderPlus, HardDrive, Loader2, Plus, X } from 'lucide-react';
import { Button, Input } from '../../../shared/view/ui';
import { browseFilesystemFolders, createFolderInFilesystem, fetchWindowsDrives } from '../data/workspaceApi';
import { getParentPath, joinFolderPath } from '../utils/pathUtils';
import type { FolderSuggestion } from '../types';

type FolderBrowserModalProps = {
  isOpen: boolean;
  autoAdvanceOnSelect: boolean;
  onClose: () => void;
  onFolderSelected: (folderPath: string, advanceToConfirm: boolean) => void;
};

export default function FolderBrowserModal({
  isOpen,
  autoAdvanceOnSelect,
  onClose,
  onFolderSelected,
}: FolderBrowserModalProps) {
  const [currentPath, setCurrentPath] = useState('~');
  const [folders, setFolders] = useState<FolderSuggestion[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [showHiddenFolders, setShowHiddenFolders] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [editingPathValue, setEditingPathValue] = useState('');
  const [drives, setDrives] = useState<Array<{ name: string; path: string }>>([]);
  const [isDrivesView, setIsDrivesView] = useState(false);

  const loadFolders = useCallback(async (pathToLoad: string) => {
    setLoadingFolders(true);
    setError(null);

    try {
      const result = await browseFilesystemFolders(pathToLoad);
      setCurrentPath(result.path);
      setFolders(result.suggestions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load folders');
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    fetchWindowsDrives().then((fetchedDrives) => {
      setDrives(fetchedDrives);
      if (fetchedDrives.length > 0) {
        setIsDrivesView(true);
        setCurrentPath('');
      } else {
        setIsDrivesView(false);
        loadFolders('~');
      }
    });
  }, [isOpen, loadFolders]);

  const visibleFolders = useMemo(
    () =>
      folders
        .filter((folder) => showHiddenFolders || !folder.name.startsWith('.'))
        .sort((firstFolder, secondFolder) =>
          firstFolder.name.toLowerCase().localeCompare(secondFolder.name.toLowerCase()),
        ),
    [folders, showHiddenFolders],
  );

  const resetNewFolderState = () => {
    setShowNewFolderInput(false);
    setNewFolderName('');
  };

  const handleClose = () => {
    setError(null);
    resetNewFolderState();
    onClose();
  };

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) {
      return;
    }

    setCreatingFolder(true);
    setError(null);

    try {
      const folderPath = joinFolderPath(currentPath, newFolderName);
      const createdPath = await createFolderInFilesystem(folderPath);
      resetNewFolderState();
      await loadFolders(createdPath);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  }, [currentPath, loadFolders, newFolderName]);

  const parentPath = getParentPath(currentPath);
  const isAtDriveRoot = parentPath === null && drives.length > 0 && !isDrivesView;

  const handleSelectDrive = (drivePath: string) => {
    setIsDrivesView(false);
    loadFolders(drivePath);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Folder</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHiddenFolders((previous) => !previous)}
              className={`rounded-md p-2 transition-colors ${
                showHiddenFolders
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              }`}
              title={showHiddenFolders ? 'Hide hidden folders' : 'Show hidden folders'}
            >
              {showHiddenFolders ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setShowNewFolderInput((previous) => !previous)}
              className={`rounded-md p-2 transition-colors ${
                showNewFolderInput
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              }`}
              title="Create new folder"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={handleClose}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showNewFolderInput && (
          <div className="border-b border-gray-200 bg-blue-50 px-4 py-3 dark:border-gray-700 dark:bg-blue-900/20">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                placeholder="New folder name"
                className="flex-1"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleCreateFolder();
                  }
                  if (event.key === 'Escape') {
                    resetNewFolderState();
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || creatingFolder}
              >
                {creatingFolder ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
              </Button>
              <Button size="sm" variant="ghost" onClick={resetNewFolderState}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 pt-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {isDrivesView ? (
            <div className="space-y-1">
              {drives.map((drive) => (
                <div key={drive.path} className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectDrive(drive.path)}
                    className="flex flex-1 items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <HardDrive className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{drive.name}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFolderSelected(drive.path, autoAdvanceOnSelect)}
                    className="px-3 text-xs"
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          ) : loadingFolders ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-1">
              {(parentPath || isAtDriveRoot) && (
                <button
                  onClick={() =>
                    isAtDriveRoot ? setIsDrivesView(true) : loadFolders(parentPath!)
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isAtDriveRoot ? (
                    <HardDrive className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FolderOpen className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {isAtDriveRoot ? 'All Drives' : '..'}
                  </span>
                </button>
              )}

              {visibleFolders.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No subfolders found
                </div>
              ) : (
                visibleFolders.map((folder) => (
                  <div key={folder.path} className="flex items-center gap-2">
                    <button
                      onClick={() => loadFolders(folder.path)}
                      className="flex flex-1 items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FolderPlus className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {folder.name}
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFolderSelected(folder.path, autoAdvanceOnSelect)}
                      className="px-3 text-xs"
                    >
                      Select
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 dark:bg-gray-900/50">
            <span className="text-sm text-gray-600 dark:text-gray-400">Path:</span>
            {isDrivesView ? (
              <code className="flex-1 truncate font-mono text-sm text-gray-500 dark:text-gray-400">
                Select a drive
              </code>
            ) : isEditingPath ? (
              <Input
                autoFocus
                className="flex-1 font-mono text-sm"
                value={editingPathValue}
                onChange={(e) => setEditingPathValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingPath(false);
                    loadFolders(editingPathValue);
                  }
                  if (e.key === 'Escape') {
                    setIsEditingPath(false);
                  }
                }}
                onBlur={() => setIsEditingPath(false)}
              />
            ) : (
              <code
                className="flex-1 truncate font-mono text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded px-1"
                title="Click to edit path"
                onClick={() => {
                  setEditingPathValue(currentPath);
                  setIsEditingPath(true);
                }}
              >
                {currentPath}
              </code>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 p-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {!isDrivesView && (
              <Button
                variant="outline"
                onClick={() => onFolderSelected(currentPath, autoAdvanceOnSelect)}
              >
                Use this folder
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
