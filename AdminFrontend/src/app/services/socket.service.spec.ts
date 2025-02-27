import { TestBed } from '@angular/core/testing';
import { SocketService } from './socket.service';
import { Socket } from 'socket.io-client';

describe('SocketService', () => {
  let service: SocketService;
  let mockSocket: jasmine.SpyObj<Socket>;

  beforeEach(() => {
    mockSocket = jasmine.createSpyObj('Socket', ['on', 'off']);

    // Mock the io method to return the mock socket
    // mockIo.and.returnValue(mockSocket);

    TestBed.configureTestingModule({
      providers: [
        SocketService,
        { provide: 'Socket', useValue: mockSocket },
      ],
    });
    service = TestBed.inject(SocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should listen to an event', (done) => {
    const testEvent = 'testEvent';
    const testData = { data: 'testData' };

    spyOn(service['socket'], 'on').and.callFake((event, callback) => {
      if (event === testEvent) {
        callback(testData);
      }
      return service['socket']; // Return the socket instance
    });

    service.on(testEvent).subscribe((data) => {
      expect(data).toEqual(testData);
      done();
    });
  });

  it('should clean up the event listener', () => {
    const testEvent = 'testEvent';
    const offSpy = spyOn(service['socket'], 'off');

    const subscription = service.on(testEvent).subscribe();
    subscription.unsubscribe();

    expect(offSpy).toHaveBeenCalledWith(testEvent);
  });
});
