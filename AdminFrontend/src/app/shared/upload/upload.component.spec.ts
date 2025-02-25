import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadComponent } from './upload.component';
import {
  FileInfo,
  FileSelectModule,
  SelectEvent,
} from '@progress/kendo-angular-upload';
import { provideHttpClient } from '@angular/common/http';
import { DialogsModule } from '@progress/kendo-angular-dialog';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileSelectModule, DialogsModule],
      declarations: [UploadComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedFile on valid file selection', () => {
    const file = { name: 'test.xlsx', extension: '.xlsx' } as FileInfo;
    const event = {
      files: [file],
      preventDefault: jasmine.createSpy(),
      isDefaultPrevented: () => false,
    } as unknown as SelectEvent;
    component.onFileSelected(event);
    expect(component.selectedFile).toBe(file);
  });

  it('should not set selectedFile on invalid file selection', () => {
    const file = { name: 'test.txt', extension: '.txt' } as FileInfo;
    const event = {
      files: [file],
      preventDefault: jasmine.createSpy(),
      isDefaultPrevented: () => false,
    } as unknown as SelectEvent;
    component.onFileSelected(event);
    expect(component.selectedFile).toBeUndefined();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should set selectedFile to undefined on file removal', () => {
    component.selectedFile = {
      name: 'test.xlsx',
      extension: '.xlsx',
    } as FileInfo;
    component.onFileRemoved();
    expect(component.selectedFile).toBeUndefined();
  });

  it('should emit closeDialog event on close', () => {
    spyOn(component.closeDialog, 'emit');
    component.close();
    expect(component.closeDialog.emit).toHaveBeenCalled();
  });

  it('should emit triggerUpload event with selected file on uploadFile', () => {
    const file = { name: 'test.xlsx', extension: '.xlsx' } as FileInfo;
    component.selectedFile = file;
    spyOn(component.triggerUpload, 'emit');
    component.uploadFile();
    expect(component.triggerUpload.emit).toHaveBeenCalledWith(file);
  });

  it('should not emit triggerUpload event if no file is selected on uploadFile', () => {
    component.selectedFile = undefined;
    spyOn(component.triggerUpload, 'emit');
    component.uploadFile();
    expect(component.triggerUpload.emit).not.toHaveBeenCalled();
  });
});
