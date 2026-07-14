import { createEmptyProject, VideoEditor } from '@ve/editor-embed';

const demoProject = createEmptyProject({ name: 'Demo Project' });

export default function App() {
  return (
    <div className="h-full">
      <VideoEditor
        initialProject={demoProject}
        className="h-full"
        onChange={() => {
          // Host apps can persist project JSON here.
        }}
      />
    </div>
  );
}
