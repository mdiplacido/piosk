import * as React from "react";

import { CaptureService } from "./capture.service";

export const CaptureServiceContext = React.createContext<CaptureService>(null as any as CaptureService);
