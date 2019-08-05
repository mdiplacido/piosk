import * as React from "react";
import * as uuid from "uuid";
import { ConfigContext } from "../config/config.provider";
import { ConfigStore } from "../config/config";
import { getDisplayName } from "../util";
import { PublisherService } from "./publisher.service";
import { Queue } from "algothizms";

export enum PublisherCompletionStatus {
    None = "None",
    Success = "Success",
    Failure = "Failure"
}

export interface PublisherCompletionEvent {
    message: string;
    status: PublisherCompletionStatus;
}

export interface IPublishInfo {
    image: Electron.NativeImage;
    name: string;
    source: string;
}

export interface IPublisherServiceProvider {
    isEnabled: boolean;
    canSend(): Promise<boolean>;
    sendImage(info: IPublishInfo): Promise<PublisherCompletionEvent>;
}

export interface IPublisherService {
    canEnqueue(): boolean;
    enqueue(info: IPublishInfo): Promise<void>;
    sendImage: IPublisherServiceProvider["sendImage"];
}

export interface IPublisherStore {
    changePassword: (password: string) => void;
    currentPassword: string;
    publisher: IPublisherService;
    queue: PublisherQueue;
}

export interface PublisherProviderProps {
    publisherStore: IPublisherStore;
}

export type PublisherQueue = Queue<{ attempts: number; info: IPublishInfo; }>;

export interface IPublisherState {
    password: string;
    queue: PublisherQueue;
}

export const PublisherContext = React.createContext<IPublisherStore>({} as IPublisherStore);

export function makePublishInfo(image: Electron.NativeImage, source: string): IPublishInfo {
    return {
        image,
        name: uuid() + ".png",
        source,
    };
}

class PublisherProvider extends React.Component<{}, IPublisherState> {
    constructor(props: any) {
        super(props);
        this.state = {
            password: "",
            queue: new Queue(),
        };
    }

    private publisherStoreFactory = (config: ConfigStore) => {
        const service = new PublisherService(config, this.state.password, this.state.queue);

        const store: IPublisherStore = {
            changePassword: password => this.setState({ password }),
            currentPassword: this.state.password,
            publisher: service,
            queue: this.state.queue,
        };

        return store;
    }

    render(): JSX.Element {
        return (
            <ConfigContext.Consumer>
                {
                    config =>
                        <PublisherContext.Provider value={this.publisherStoreFactory(config)}>
                            {this.props.children}
                        </PublisherContext.Provider>
                }
            </ConfigContext.Consumer>
        );
    }
}

export function withPublisher<P extends {}>(
    Component: React.ComponentClass<PublisherProviderProps & P> | React.FC<PublisherProviderProps & P>
): React.RefForwardingComponent<typeof Component, P> {
    const c: React.RefForwardingComponent<typeof Component, P> = (props: P) => {
        return (
            <PublisherContext.Consumer>
                {publisher =>
                    <Component {...props} publisherStore={publisher} />
                }
            </PublisherContext.Consumer>
        );
    };

    c.displayName = `withPublisher(${getDisplayName(Component)})`;
    return c;
}

export default PublisherProvider;
